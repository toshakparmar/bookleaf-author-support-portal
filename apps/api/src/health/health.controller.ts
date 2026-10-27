import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness, database connection, and AI provider configuration health check' })
  @ApiResponse({ status: 200, description: 'Health check report' })
  async check() {
    let dbStatus = 'disconnected';
    let dbLatencyMs = 0;

    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      dbLatencyMs = Date.now() - start;
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }

    const aiProvider = process.env.AI_PROVIDER || 'anthropic';
    const aiModel = process.env.AI_MODEL || 'claude-3-5-haiku-20241022';
    const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 5);
    const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5);
    const hasGeminiKey = Boolean(
      (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) &&
      (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)!.length > 5,
    );

    const isAiConfigured =
      aiProvider === 'openai'
        ? hasOpenAiKey
        : aiProvider === 'gemini' || aiProvider === 'google'
          ? hasGeminiKey
          : hasAnthropicKey;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      ai: {
        provider: aiProvider,
        model: aiModel,
        configured: isAiConfigured,
        // Notice: never leaks raw keys!
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
