import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { LlmProvider, LlmPromptPayload, LlmCompletionResult } from './llm-provider.interface';

@Injectable()
export class OpenAiProvider implements LlmProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private client: OpenAI | null = null;
  private readonly defaultModel: string;

  constructor() {
    this.defaultModel = process.env.AI_MODEL || 'gpt-4o-mini';
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY is not configured. OpenAI calls will fail gracefully to heuristics.');
    }
  }

  getProviderName(): string {
    return 'openai';
  }

  async complete(payload: LlmPromptPayload): Promise<LlmCompletionResult> {
    if (!this.client) {
      throw new Error('OpenAI client is not initialized (missing API key)');
    }

    const start = Date.now();
    const model = this.defaultModel;

    const response = await this.client.chat.completions.create({
      model,
      temperature: payload.temperature ?? 0,
      max_tokens: payload.maxTokens || 1024,
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
