import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { TicketsModule } from './tickets/tickets.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // Global rate limit
      },
    ]),
    PrismaModule,
    AuthModule,
    AuthorsModule,
    BooksModule,
    TicketsModule,
    AdminModule,
    AiModule,
    EventsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Default-deny global authentication
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Role-based access control
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter, // Uniform error envelope
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor, // X-Request-Id tagging
    },
  ],
})
export class AppModule {}
