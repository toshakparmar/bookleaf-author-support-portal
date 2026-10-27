import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';

// Load root or app .env before booting
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. Fail fast on environment misconfigurations
  const validatedConfig = validateEnv(process.env);
  const port = validatedConfig.PORT || 3001;

  const app = await NestFactory.create(AppModule);

  // 2. Security Headers & Cookie Parser
  app.use(helmet());
  app.use(cookieParser(validatedConfig.COOKIE_SECRET));

  // 3. CORS Configuration
  app.enableCors({
    origin: [
      validatedConfig.CORS_ORIGIN,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Cache-Control'],
  });

  // 4. Global Prefix
  app.setGlobalPrefix('api/v1');

  // 5. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Swagger / OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BookLeaf Author Support & Communication API')
    .setDescription(
      'REST API for BookLeaf author portal, ops admin console, real-time ticket streaming, and AI triage/drafting.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('bookleaf_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Export openapi.json for documentation deliverables
  try {
    const docsDir = path.resolve(__dirname, '../../../docs');
    if (fs.existsSync(docsDir)) {
      fs.writeFileSync(path.join(docsDir, 'openapi.json'), JSON.stringify(document, null, 2));
      logger.log('📄 Exported docs/openapi.json');
    }
  } catch (err: any) {
    logger.warn(`Could not export openapi.json: ${err.message}`);
  }

  await app.listen(port);
  logger.log(`🚀 BookLeaf API running at http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger documentation at http://localhost:${port}/api/docs`);
}

bootstrap();
