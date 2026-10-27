import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { LlmProvider, LlmPromptPayload, LlmCompletionResult } from './llm-provider.interface';

@Injectable()
export class AnthropicProvider implements LlmProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private client: Anthropic | null = null;
  private readonly defaultModel: string;

  constructor() {
    this.defaultModel = process.env.AI_MODEL || 'claude-3-5-haiku-20241022';
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY is not configured. Anthropic calls will fail gracefully to heuristics.');
    }
  }

  getProviderName(): string {
    return 'anthropic';
  }

  async complete(payload: LlmPromptPayload): Promise<LlmCompletionResult> {
    if (!this.client) {
      throw new Error('Anthropic client is not initialized (missing API key)');
    }

    const start = Date.now();
    const model = this.defaultModel;

    // Use prompt caching on the system prompt block
    const response = await this.client.messages.create({
      model,
      max_tokens: payload.maxTokens || 1024,
      temperature: payload.temperature ?? 0,
      system: [
        {
          type: 'text',
          text: payload.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: payload.userPrompt,
        },
      ],
    });

    const latencyMs = Date.now() - start;
    const text = response.content
      .filter((c) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      latencyMs,
      model,
    };
  }
}
