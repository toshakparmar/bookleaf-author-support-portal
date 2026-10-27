import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, interval, merge } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

export interface AppServerEvent {
  type: 'ticket.created' | 'ticket.updated' | 'ticket.message' | 'ticket.ai_ready' | 'heartbeat';
  data: any;
  authorId?: string; // If scoped to a specific author
  ticketId?: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly eventStream$ = new Subject<AppServerEvent>();

  emitEvent(event: AppServerEvent) {
    this.logger.debug(`Emitting event: ${event.type}`);
    this.eventStream$.next(event);
  }

  getStreamForUser(user: AuthenticatedUser): Observable<MessageEvent> {
    // 25s Heartbeat to prevent timeouts
    const heartbeat$ = interval(25000).pipe(
      map(() => ({
        type: 'heartbeat' as const,
        data: { timestamp: new Date().toISOString() },
      })),
    );

    const merged$ = merge(this.eventStream$, heartbeat$);

    return merged$.pipe(
      filter((evt: AppServerEvent) => {
        if (evt.type === 'heartbeat') return true;
        // Admins receive all events across the platform
        if (user.role === 'ADMIN') return true;
        // Authors only receive events concerning their own authorId
        if (user.role === 'AUTHOR') {
          return evt.authorId === user.authorId;
        }
        return false;
      }),
      map((evt: AppServerEvent) => {
        return {
          data: JSON.stringify({
            type: evt.type,
            payload: evt.data,
            timestamp: new Date().toISOString(),
          }),
        } as MessageEvent;
      }),
    );
  }
}
