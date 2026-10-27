import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { KbRetriever } from './knowledge-base/kb.retriever';
import { AuthorContextBuilder } from './context/author-context.builder';

@Module({
  providers: [
    AiService,
    AnthropicProvider,
    OpenAiProvider,
    KbRetriever,
    AuthorContextBuilder,
  ],
  exports: [AiService, KbRetriever, AuthorContextBuilder],
})
export class AiModule {}
