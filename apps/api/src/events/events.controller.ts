import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Server-Sent Events (SSE) real-time stream' })
  stream(@CurrentUser() user: AuthenticatedUser): Observable<MessageEvent> {
    return this.eventsService.getStreamForUser(user);
  }
}
