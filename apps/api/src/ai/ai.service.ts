import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { LlmProvider } from './providers/llm-provider.interface';
import { KbRetriever } from './knowledge-base/kb.retriever';
import { AuthorContextBuilder } from './context/author-context.builder';
import { buildClassifyPrompt } from './prompts/classify.prompt';
import { buildDraftPrompt } from './prompts/draft.prompt';
import { ClassificationResultSchema, DraftResultSchema, ClassificationResult, DraftResult } from './schemas/ai.schemas';
import { evaluatePriorityRules } from './heuristics/priority-rules';
import { classifyByKeywords } from './heuristics/keyword-classifier';
import { Category, Priority, AiStatus } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private provider: LlmProvider;

  // Circuit breaker state
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private readonly CIRCUIT_FAILURE_THRESHOLD = 3;
  private readonly CIRCUIT_COOLDOWN_MS = 60000; // 60 seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly anthropicProvider: AnthropicProvider,
    private readonly openAiProvider: OpenAiProvider,
    private readonly kbRetriever: KbRetriever,
    private readonly authorContextBuilder: AuthorContextBuilder,
  ) {
    const chosenProvider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
    this.provider = chosenProvider === 'openai' ? this.openAiProvider : this.anthropicProvider;
    this.logger.log(`Initialized AI Service with provider: ${this.provider.getProviderName()}`);
  }

  /**
   * Asynchronously classifies a ticket in the background (non-blocking).
   */
  async classifyTicketAsync(ticketId: string): Promise<void> {
    setImmediate(async () => {
      try {
        await this.classifyTicket(ticketId);
      } catch (err: any) {
        this.logger.error(`Async classification failed for ticket ${ticketId}: ${err.message}`);
      }
    });
  }

  /**
   * Classify ticket category and priority with deterministic fallback safety net.
   */
  async classifyTicket(ticketId: string): Promise<ClassificationResult> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { book: true, author: true },
    });

    if (!ticket) {
      throw new Error(`Ticket not found: ${ticketId}`);
    }

    const { systemPrompt, userPrompt } = buildClassifyPrompt({
      subject: ticket.subject,
      description: ticket.description,
      bookTitle: ticket.book?.title,
      bookStatus: ticket.book?.status,
    });

    let result: ClassificationResult;
    let usedFallback = false;
    let tokensIn = 0;
    let tokensOut = 0;
    let latency = 0;

    // Check circuit breaker or provider readiness
    if (this.isCircuitOpen()) {
      this.logger.warn(`Circuit breaker open. Using keyword heuristic fallback for ${ticket.ticketNumber}`);
      result = classifyByKeywords(ticket.subject, ticket.description, ticket.book?.status);
      usedFallback = true;
    } else {
      try {
        const completion = await this.executeWithRetry(async () => {
          return this.provider.complete({
            systemPrompt,
            userPrompt,
            temperature: 0,
            maxTokens: 200,
            jsonMode: true,
          });
        });

        tokensIn = completion.inputTokens;
        tokensOut = completion.outputTokens;
        latency = completion.latencyMs;

        // Parse and validate JSON
        result = this.parseClassificationJson(completion.text);
        this.resetCircuit();
      } catch (err: any) {
        this.logger.warn(`AI classification call failed for ${ticket.ticketNumber}: ${err.message}. Falling back to heuristics.`);
        this.recordFailure();

        result = classifyByKeywords(ticket.subject, ticket.description, ticket.book?.status);
        usedFallback = true;
      }
    }

    // Apply deterministic safety net rules
    const priorityEval = evaluatePriorityRules(
      result.priority,
      result.category,
      ticket.subject,
      ticket.description,
    );

    const finalPriority = priorityEval.finalPriority;
    const aiStatus = usedFallback ? AiStatus.FAILED : AiStatus.DONE;

    // Update ticket
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        category: ticket.categoryOverriddenBy ? ticket.category : result.category,
        aiCategory: result.category,
        priority: ticket.priorityOverriddenBy ? ticket.priority : finalPriority,
        aiPriority: result.priority,
        aiStatus,
        aiClassifiedAt: new Date(),
      },
    });

    // Record audit event
    await this.prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        type: usedFallback ? 'AI_FAILED' : 'AI_CLASSIFIED',
        meta: {
          category: result.category,
          priority: finalPriority,
          confidence: result.confidence,
          reasoning: result.reasoning,
          ruleFloorTriggered: priorityEval.ruleTriggered || null,
          usedFallback,
        },
      },
    });

    // Record AI Log
    await this.prisma.aiLog.create({
      data: {
        ticketId: ticket.id,
        kind: 'CLASSIFY',
        model: this.provider.getProviderName(),
        inputTokens: tokensIn,
        outputTokens: tokensOut,
        estimatedCostUsd: this.calculateEstimatedCost(tokensIn, tokensOut),
        latencyMs: latency,
        success: !usedFallback,
        errorType: usedFallback ? 'FALLBACK_HEURISTIC' : null,
      },
    });

    // Emit real-time SSE event for admin queue
    this.eventsService.emitEvent({
      type: 'ticket.ai_ready',
      ticketId: ticket.id,
      authorId: ticket.authorId,
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        category: updatedTicket.category,
        priority: updatedTicket.priority,
        aiStatus: updatedTicket.aiStatus,
      },
    });

    return result;
  }

  /**
   * Generates or retrieves cached draft response for an admin viewing a ticket.
   */
  async generateDraft(ticketId: string, adminUserId?: string, force = false): Promise<DraftResult> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        author: true,
        book: true,
        messages: { orderBy: { createdAt: 'asc' }, take: 4 },
      },
    });

    if (!ticket) {
      throw new Error(`Ticket not found: ${ticketId}`);
    }

    // Retrieve category-scoped knowledge base
    const kbContext = this.kbRetriever.retrieveForTicket(ticket.category, `${ticket.subject} ${ticket.description}`);

    // Build author/book context and computed facts
    const authorCtx = await this.authorContextBuilder.buildContext(ticket.authorId, ticket.bookId);

    // Compute version hash for caching
    const lastMsgId = ticket.messages[ticket.messages.length - 1]?.id || 'no_msg';
    const versionString = `${ticket.description.trim()}_${lastMsgId}_${authorCtx.bookSnapshotHash}_${ticket.category}`;
    const basedOnVersion = crypto.createHash('sha256').update(versionString).digest('hex').substring(0, 16);

    // Check cache unless forced
    if (!force) {
      const existingDraft = await this.prisma.aiDraft.findFirst({
        where: { ticketId, basedOnVersion },
        orderBy: { createdAt: 'desc' },
      });

      if (existingDraft) {
        this.logger.debug(`Returning cached AI draft for ticket ${ticket.ticketNumber} [hash: ${basedOnVersion}]`);
        return {
          draft: existingDraft.body,
          flags: existingDraft.flags,
          suggestedStatus: 'IN_PROGRESS',
        };
      }
    }

    // Get admin first name if available
    let adminFirstName: string | undefined = undefined;
    if (adminUserId) {
      const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
      if (admin) adminFirstName = admin.name.split(' ')[0];
    }

    const { systemPrompt, userPrompt } = buildDraftPrompt({
      authorFirstName: authorCtx.authorFirstName,
      adminFirstName,
      kbContext: kbContext.formattedText,
      bookContext: authorCtx.bookContextText,
      computedFacts: authorCtx.computedFactsText,
      subject: ticket.subject,
      description: ticket.description,
      historyMessages: ticket.messages.map((m) => ({
        sender: m.sender,
        body: m.body,
        createdAt: m.createdAt.toISOString().split('T')[0],
      })),
    });

    let draftResult: DraftResult;
    let tokensIn = 0;
    let tokensOut = 0;
    let latency = 0;
    let callSucceeded = true;

    if (this.isCircuitOpen()) {
      draftResult = this.getTemplateDraftFallback(ticket.category, authorCtx.authorFirstName);
      callSucceeded = false;
    } else {
      try {
        const completion = await this.executeWithRetry(async () => {
          return this.provider.complete({
            systemPrompt,
            userPrompt,
            temperature: 0.3,
            maxTokens: 600,
            jsonMode: true,
          });
        });

        tokensIn = completion.inputTokens;
        tokensOut = completion.outputTokens;
        latency = completion.latencyMs;

        draftResult = this.parseDraftJson(completion.text);
        this.resetCircuit();
      } catch (err: any) {
        this.logger.error(`AI draft generation failed for ${ticket.ticketNumber}: ${err.message}`);
        this.recordFailure();

        draftResult = this.getTemplateDraftFallback(ticket.category, authorCtx.authorFirstName);
        callSucceeded = false;
      }
    }

    // Persist draft
    await this.prisma.aiDraft.create({
      data: {
        ticketId: ticket.id,
        body: draftResult.draft,
        flags: draftResult.flags,
        model: this.provider.getProviderName(),
        inputTokens: tokensIn,
        outputTokens: tokensOut,
        basedOnVersion,
      },
    });

    // Record AI Log
    await this.prisma.aiLog.create({
      data: {
        ticketId: ticket.id,
        kind: 'DRAFT',
        model: this.provider.getProviderName(),
        inputTokens: tokensIn,
        outputTokens: tokensOut,
        estimatedCostUsd: this.calculateEstimatedCost(tokensIn, tokensOut),
        latencyMs: latency,
        success: callSucceeded,
        errorType: callSucceeded ? null : 'FALLBACK_TEMPLATE',
      },
    });

    return draftResult;
  }

  /**
   * Fallback response template when LLM is unavailable.
   */
  private getTemplateDraftFallback(category: Category, authorName: string): DraftResult {
    let draft = `Dear ${authorName},\n\nThank you for reaching out to BookLeaf Publishing. We have received your query and our team is actively reviewing the details. We will investigate this and provide you with a full update within 48 hours.\n\nPlease let us know if there are any additional details you would like us to note in the meantime.\n\nWarm regards,\nTeam BookLeaf`;
    const flags = ['AI unavailable — using non-AI template draft. Please review and customize before sending.'];

    if (category === Category.ROYALTY_PAYMENTS) {
      draft = `Dear ${authorName},\n\nThank you for contacting us regarding your royalties. At BookLeaf, royalties are 80% of net profit calculated quarterly and disbursed within 45 days of quarter end. Our operations team is pulling your detailed sales statement across platforms and will update you within 48 hours.\n\nWarm regards,\nTeam BookLeaf`;
      flags.push('Verify author bank details and pending balance in ledger');
    } else if (category === Category.PRINTING_QUALITY) {
      draft = `Dear ${authorName},\n\nWe sincerely apologize for the printing issue with your copies. BookLeaf guarantees quality, and any defective copy is eligible for a free reprint. Please reply to this thread with photos of the misprinted pages so our quality control team can verify and dispatch your reprint within 5-7 business days.\n\nWarm regards,\nTeam BookLeaf`;
      flags.push('Awaiting photo proof from author before approving reprint');
    }

    return {
      draft,
      flags,
      suggestedStatus: 'IN_PROGRESS',
    };
  }

  // --- Helper parsing and resilience methods ---

  private parseClassificationJson(raw: string): ClassificationResult {
    try {
      const clean = this.cleanJsonString(raw);
      const parsed = JSON.parse(clean);
      return ClassificationResultSchema.parse(parsed);
    } catch {
      // 1 repair retry on bad JSON
      const repaired = this.cleanJsonString(raw);
      const match = repaired.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return ClassificationResultSchema.parse(parsed);
      }
      throw new Error('Failed to parse valid JSON from AI classification output');
    }
  }

  private parseDraftJson(raw: string): DraftResult {
    try {
      const clean = this.cleanJsonString(raw);
      const parsed = JSON.parse(clean);
      return DraftResultSchema.parse(parsed);
    } catch {
      const clean = this.cleanJsonString(raw);
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return DraftResultSchema.parse(parsed);
      }
      throw new Error('Failed to parse valid JSON from AI draft output');
    }
  }

  private cleanJsonString(str: string): string {
    return str
      .replace(/^```json/im, '')
      .replace(/^```/im, '')
      .replace(/```$/im, '')
      .trim();
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, retries = 2, delay = 800): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (retries <= 0) throw err;
      const jitter = Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, delay + jitter));
      return this.executeWithRetry(fn, retries - 1, delay * 2);
    }
  }

  private isCircuitOpen(): boolean {
    if (this.circuitOpenUntil > Date.now()) return true;
    return false;
  }

  private recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.CIRCUIT_FAILURE_THRESHOLD) {
      this.circuitOpenUntil = Date.now() + this.CIRCUIT_COOLDOWN_MS;
      this.logger.warn(`Circuit breaker opened for ${this.CIRCUIT_COOLDOWN_MS / 1000}s due to ${this.failureCount} consecutive failures.`);
    }
  }

  private resetCircuit() {
    this.failureCount = 0;
    this.circuitOpenUntil = 0;
  }

  private calculateEstimatedCost(inputTokens: number, outputTokens: number): number {
    // Claude 3.5 Haiku pricing: $0.80 / 1M in, $4.00 / 1M out
    const costIn = (inputTokens / 1_000_000) * 0.8;
    const costOut = (outputTokens / 1_000_000) * 4.0;
    return Number((costIn + costOut).toFixed(6));
  }
}
