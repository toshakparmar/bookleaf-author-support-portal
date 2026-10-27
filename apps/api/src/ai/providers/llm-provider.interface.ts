export interface LlmCompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
}

export interface LlmPromptPayload {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LlmProvider {
  getProviderName(): string;
  complete(payload: LlmPromptPayload): Promise<LlmCompletionResult>;
}
