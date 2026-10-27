import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { LlmProvider, LlmPromptPayload, LlmCompletionResult } from './llm-provider.interface';

@Injectable()
export class GeminiProvider implements LlmProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private client: OpenAI | null = null;
  private readonly defaultModel: string;

  constructor() {
    this.defaultModel = process.env.AI_MODEL || 'gemini-3.5-flash';
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      });
      this.logger.log(`Gemini Provider initialized with model: ${this.defaultModel}`);
    } else {
      this.logger.warn('GEMINI_API_KEY is not configured. Calls will fall back to heuristics.');
    }
  }

  getProviderName(): string {
    return 'gemini';
  }

  async complete(payload: LlmPromptPayload): Promise<LlmCompletionResult> {
    if (!this.client) {
      throw new Error('Gemini client is not initialized (missing GEMINI_API_KEY or GOOGLE_API_KEY)');
    }

    const start = Date.now();
    const model = this.defaultModel;

    const maxTokens = Math.max((payload.maxTokens || 1024) + 1500, 3000);

    const response = await this.client.chat.completions.create({
      model,
      temperature: payload.temperature ?? 0,
      max_tokens: maxTokens,
      response_format: payload.jsonMode ? { type: 'json_object' } : undefined,
      messages: [
        { role: 'system', content: payload.systemPrompt },
        { role: 'user', content: payload.userPrompt },
      ],
    });

    const latencyMs = Date.now() - start;
    const text = response.choices[0]?.message?.content || '';

    return {
      text,
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      latencyMs,
      model,
    };
  }
}
