import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AiService } from '../ai/ai.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Category, Priority, TicketStatus, MessageSender, Prisma } from '@prisma/client';
import { ErrorCode } from '../common/errors/error-codes';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Create ticket by author. Persists immediately and triggers asynchronous AI triage.
   */
  async createTicket(authorId: string, userId: string, dto: CreateTicketDto) {
    // 1. Verify book belongs to author if provided
    if (dto.bookId) {
      const book = await this.prisma.book.findFirst({
        where: { id: dto.bookId, authorId },
      });
      if (!book) {
        throw new NotFoundException({
          code: ErrorCode.BOOK_NOT_FOUND,
          message: 'Referenced book not found for this author account',
        });
      }
    }

    // 2. Generate friendly sequential or unique ticket number
    const count = await this.prisma.ticket.count();
    const ticketNumber = `BL-${1000 + count + 1}`;

    // 3. Persist ticket with default baseline status and category
    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        authorId,
        bookId: dto.bookId || null,
        subject: dto.subject.trim(),
        description: dto.description.trim(),
        status: TicketStatus.OPEN,
        category: Category.GENERAL_INQUIRY, // Will be updated by AI or keyword fallback
        priority: Priority.MEDIUM,
        attachmentMeta: dto.attachmentMeta || Prisma.JsonNull,
      },
      include: {
        book: {
          select: { id: true, title: true, status: true, isbn: true },
        },
      },
    });

    // 4. Create initial CREATED audit event
    await this.prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        actorId: userId,
        type: 'CREATED',
        meta: { subject: ticket.subject, bookId: ticket.bookId },
      },
    });

    // 5. Emit real-time SSE event for admin queue
    this.eventsService.emitEvent({
      type: 'ticket.created',
      ticketId: ticket.id,
      authorId,
      data: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        category: ticket.category,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      },
    });

    // 6. Asynchronously trigger AI triage without blocking HTTP 201 response
    this.aiService.classifyTicketAsync(ticket.id);

    return ticket;
  }

  /**
   * List tickets for the logged-in author (with pagination and optional status filter).
   */
  async getAuthorTickets(
    authorId: string,
    page = 1,
    pageSize = 20,
    status?: TicketStatus,
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.TicketWhereInput = {
      authorId, // Strict author scoping
      ...(status ? { status } : {}),
    };

    const [total, tickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { lastActivityAt: 'desc' },
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          category: true,
          createdAt: true,
          lastActivityAt: true,
          resolvedAt: true,
          book: {
            select: { id: true, title: true, status: true },
          },
          // Notice: NO internal notes, drafts, or aiPriority exposed to author!
        },
      }),
    ]);

    return {
      data: tickets,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get single ticket and conversation thread for the author.
   */
  async getAuthorTicketById(authorId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        authorId, // Strict scoping -> 404 if not theirs
      },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        description: true,
        status: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        resolvedAt: true,
        lastActivityAt: true,
        attachmentMeta: true,
        book: {
          select: {
            id: true,
            title: true,
            isbn: true,
            status: true,
            mrp: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sender: true,
            body: true,
            createdAt: true,
            // Notice: wasAiDrafted and internal details are not exposed to author!
          },
        },
        // internalNotes is NOT selected
      },
    });

    if (!ticket) {
      throw new NotFoundException({
        code: ErrorCode.TICKET_NOT_FOUND,
        message: 'Ticket not found',
      });
    }

    return ticket;
  }

  /**
   * Author adds a follow-up reply to an existing ticket.
   * If resolved, automatically re-opens the ticket.
   */
  async addAuthorReply(authorId: string, userId: string, ticketId: string, dto: CreateMessageDto) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, authorId },
    });

    if (!ticket) {
      throw new NotFoundException({
        code: ErrorCode.TICKET_NOT_FOUND,
        message: 'Ticket not found',
      });
    }

    const isReopening = ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED;

    const [message] = await this.prisma.$transaction([
      this.prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          sender: MessageSender.AUTHOR,
          senderUserId: userId,
          body: dto.body.trim(),
        },
      }),
      this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          lastActivityAt: new Date(),
          status: isReopening ? TicketStatus.OPEN : ticket.status,
          resolvedAt: isReopening ? null : ticket.resolvedAt,
        },
      }),
      this.prisma.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          actorId: userId,
          type: isReopening ? 'STATUS_CHANGED' : 'REPLY_SENT',
          meta: {
            sender: MessageSender.AUTHOR,
            reopened: isReopening,
            bodyLength: dto.body.length,
          },
        },
      }),
    ]);

    // Emit real-time SSE event
    this.eventsService.emitEvent({
      type: 'ticket.message',
      ticketId: ticket.id,
      authorId,
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        sender: MessageSender.AUTHOR,
        body: dto.body.trim(),
        createdAt: message.createdAt,
        status: isReopening ? TicketStatus.OPEN : ticket.status,
      },
    });

    return message;
  }
}
