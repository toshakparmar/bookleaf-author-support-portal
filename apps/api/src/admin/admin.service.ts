import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { AdminTicketsQueryDto } from './dto/admin-tickets-query.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateAdminReplyDto } from './dto/create-admin-reply.dto';
import { CreateInternalNoteDto } from './dto/create-internal-note.dto';
import { TicketStatus, Priority, MessageSender, Prisma } from '@prisma/client';
import { ErrorCode } from '../common/errors/error-codes';

const SLA_HOURS: Record<Priority, number> = {
  [Priority.CRITICAL]: Number(process.env.SLA_HOURS_CRITICAL || 4),
  [Priority.HIGH]: Number(process.env.SLA_HOURS_HIGH || 24),
  [Priority.MEDIUM]: Number(process.env.SLA_HOURS_MEDIUM || 72),
  [Priority.LOW]: Number(process.env.SLA_HOURS_LOW || 168),
};

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Admin Ticket Queue with rich filtering, search, urgency sort, and SLA flags.
   */
  async getTicketsQueue(query: AdminTicketsQueryDto, currentAdminId: string) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const where: Prisma.TicketWhereInput = {};

    // 1. Status Filter
    if (query.status) {
      where.status = query.status;
    }

    // 2. Category Filter
    if (query.category) {
      where.category = query.category;
    }

    // 3. Priority Filter
    if (query.priority) {
      where.priority = query.priority;
    }

    // 4. Assignee Filter
    if (query.assignee) {
      if (query.assignee === 'mine') {
        where.assignedToId = currentAdminId;
      } else if (query.assignee === 'unassigned') {
        where.assignedToId = null;
      } else if (query.assignee !== 'all') {
        where.assignedToId = query.assignee;
      }
    }

    // 5. Date Range Filter
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    // 6. Text Search (subject, description, ticketNumber, author name, book title)
    if (query.q && query.q.trim()) {
      const search = query.q.trim();
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
        { book: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch tickets with relations
    const [rawTotal, tickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        include: {
          author: {
            select: { id: true, authorCode: true, name: true, city: true },
          },
          book: {
            select: { id: true, bookCode: true, title: true, status: true, isbn: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    const now = Date.now();

    // Calculate SLA flags and age for each ticket
    const enrichedTickets = tickets.map((t) => {
      const ageMs = now - t.createdAt.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      const slaThresholdHours = SLA_HOURS[t.priority] || 72;
      const isUnresolved = t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS;
      const isSlaBreached = isUnresolved && ageHours > slaThresholdHours;
      const slaRemainingHours = Math.max(0, Number((slaThresholdHours - ageHours).toFixed(1)));

      return {
        ...t,
        ageHours: Number(ageHours.toFixed(1)),
        isSlaBreached,
        slaThresholdHours,
        slaRemainingHours,
      };
    });

    // Filter by SLA breached if requested
    let filtered = enrichedTickets;
    if (query.slaBreached) {
      filtered = filtered.filter((t) => t.isSlaBreached);
    }

    // Sort by Urgency (default):
    // 1. Unresolved status first
    // 2. SLA breached first
    // 3. Priority ranking (CRITICAL -> HIGH -> MEDIUM -> LOW)
    // 4. Oldest first (FIFO)
    const priorityWeight: Record<Priority, number> = {
      [Priority.CRITICAL]: 4,
      [Priority.HIGH]: 3,
      [Priority.MEDIUM]: 2,
      [Priority.LOW]: 1,
    };

    filtered.sort((a, b) => {
      if (query.sort === 'newest') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (query.sort === 'oldest' || query.oldestUnresolved) {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else if (query.sort === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }

      // Default: Urgency Sort
      const aUnresolved = a.status === TicketStatus.OPEN || a.status === TicketStatus.IN_PROGRESS ? 1 : 0;
      const bUnresolved = b.status === TicketStatus.OPEN || b.status === TicketStatus.IN_PROGRESS ? 1 : 0;
      if (aUnresolved !== bUnresolved) return bUnresolved - aUnresolved;

      const aBreached = a.isSlaBreached ? 1 : 0;
      const bBreached = b.isSlaBreached ? 1 : 0;
      if (aBreached !== bBreached) return bBreached - aBreached;

      const aPriority = priorityWeight[a.priority] || 1;
      const bPriority = priorityWeight[b.priority] || 1;
      if (aPriority !== bPriority) return bPriority - aPriority;

      return a.createdAt.getTime() - b.createdAt.getTime(); // Oldest unresolved first
    });

    // Pagination
    const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginatedData,
      meta: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  }

  /**
   * Full ticket detail for admin including notes, audit events, book details, and AI drafts.
   */
  async getTicketDetail(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        author: {
          select: {
            id: true,
            authorCode: true,
            name: true,
            phone: true,
            city: true,
            joinedDate: true,
            user: {
              select: { email: true },
            },
          },
        },
        book: true, // Live book facts: royalties, status, print partner, platforms
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            senderUser: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        internalNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        drafts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException({
        code: ErrorCode.TICKET_NOT_FOUND,
        message: 'Ticket not found',
      });
    }

    const now = Date.now();
    const ageMs = now - ticket.createdAt.getTime();
    const ageHours = Number((ageMs / (1000 * 60 * 60)).toFixed(1));
    const slaThresholdHours = SLA_HOURS[ticket.priority] || 72;
    const isUnresolved = ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS;
    const isSlaBreached = isUnresolved && ageHours > slaThresholdHours;
    const slaRemainingHours = Math.max(0, Number((slaThresholdHours - ageHours).toFixed(1)));

    return {
      ...ticket,
      ageHours,
      slaThresholdHours,
      isSlaBreached,
      slaRemainingHours,
    };
  }

  /**
   * Update status, category, priority, or assignee (records overrides and audit events).
   */
  async updateTicket(ticketId: string, adminId: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException({ code: ErrorCode.TICKET_NOT_FOUND, message: 'Ticket not found' });
    }

    const updateData: Prisma.TicketUpdateInput = {};
    const eventsToCreate: Prisma.TicketEventCreateManyInput[] = [];

    // 1. Status change
    if (dto.status && dto.status !== ticket.status) {
      updateData.status = dto.status;
      if (dto.status === TicketStatus.RESOLVED || dto.status === TicketStatus.CLOSED) {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }
      eventsToCreate.push({
        ticketId,
        actorId: adminId,
        type: 'STATUS_CHANGED',
        meta: { from: ticket.status, to: dto.status },
      });
    }

    // 2. Category override
    if (dto.category && dto.category !== ticket.category) {
      updateData.category = dto.category;
      updateData.categoryOverriddenBy = adminId;
      eventsToCreate.push({
        ticketId,
        actorId: adminId,
        type: 'CATEGORY_OVERRIDDEN',
        meta: { from: ticket.category, to: dto.category, aiCategory: ticket.aiCategory },
      });
    }

    // 3. Priority override
    if (dto.priority && dto.priority !== ticket.priority) {
      updateData.priority = dto.priority;
      updateData.priorityOverriddenBy = adminId;
      eventsToCreate.push({
        ticketId,
        actorId: adminId,
        type: 'PRIORITY_OVERRIDDEN',
        meta: { from: ticket.priority, to: dto.priority, aiPriority: ticket.aiPriority },
      });
    }

    // 4. Assignee change
    if (dto.assignedToId !== undefined && dto.assignedToId !== ticket.assignedToId) {
      updateData.assignedTo = dto.assignedToId ? { connect: { id: dto.assignedToId } } : { disconnect: true };
      eventsToCreate.push({
        ticketId,
        actorId: adminId,
        type: 'ASSIGNED',
        meta: { from: ticket.assignedToId, to: dto.assignedToId },
      });
    }

    updateData.lastActivityAt = new Date();

    const [updatedTicket] = await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: updateData,
      }),
      this.prisma.ticketEvent.createMany({
        data: eventsToCreate,
      }),
    ]);

    // Emit real-time SSE event
    this.eventsService.emitEvent({
      type: 'ticket.updated',
      ticketId: ticket.id,
      authorId: ticket.authorId,
      data: {
        id: updatedTicket.id,
        status: updatedTicket.status,
        category: updatedTicket.category,
        priority: updatedTicket.priority,
        assignedToId: updatedTicket.assignedToId,
      },
    });

    return updatedTicket;
  }

  /**
   * Self-assign ticket to current admin.
   */
  async assignToMe(ticketId: string, adminId: string) {
    return this.updateTicket(ticketId, adminId, { assignedToId: adminId });
  }

  /**
   * Add internal staff note (never visible to authors).
   */
  async addInternalNote(ticketId: string, adminId: string, dto: CreateInternalNoteDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException({ code: ErrorCode.TICKET_NOT_FOUND, message: 'Ticket not found' });
    }

    const note = await this.prisma.internalNote.create({
      data: {
        ticketId,
        adminId,
        body: dto.body.trim(),
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await this.prisma.ticketEvent.create({
      data: {
        ticketId,
        actorId: adminId,
        type: 'NOTE_ADDED',
        meta: { noteId: note.id, bodyLength: dto.body.length },
      },
    });

    return note;
  }

  /**
   * Send admin reply to author.
   * Sending first reply automatically transitions OPEN -> IN_PROGRESS.
   */
  async sendReply(ticketId: string, adminId: string, dto: CreateAdminReplyDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException({ code: ErrorCode.TICKET_NOT_FOUND, message: 'Ticket not found' });
    }

    const isFirstReply = ticket.status === TicketStatus.OPEN;
    const newStatus = isFirstReply ? TicketStatus.IN_PROGRESS : ticket.status;

    const [message] = await this.prisma.$transaction([
      this.prisma.ticketMessage.create({
        data: {
          ticketId,
          sender: MessageSender.ADMIN,
          senderUserId: adminId,
          body: dto.body.trim(),
          wasAiDrafted: Boolean(dto.aiDraftId),
          aiDraftId: dto.aiDraftId || null,
        },
        include: {
          senderUser: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: newStatus,
          lastActivityAt: new Date(),
        },
      }),
      this.prisma.ticketEvent.create({
        data: {
          ticketId,
          actorId: adminId,
          type: 'REPLY_SENT',
          meta: {
            sender: MessageSender.ADMIN,
            wasAiDrafted: Boolean(dto.aiDraftId),
            autoMovedStatus: isFirstReply ? TicketStatus.IN_PROGRESS : null,
          },
        },
      }),
    ]);

    // Emit real-time SSE event for author view and admin queue
    this.eventsService.emitEvent({
      type: 'ticket.message',
      ticketId: ticket.id,
      authorId: ticket.authorId,
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        sender: MessageSender.ADMIN,
        body: message.body,
        createdAt: message.createdAt,
        status: newStatus,
      },
    });

    return message;
  }

  /**
   * Admin dashboard statistics and AI usage summary card.
   */
  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      unassignedTickets,
      allUnresolved,
      aiLogsToday,
      totalAiLogs,
    ] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
      this.prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      this.prisma.ticket.count({
        where: {
          status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
          assignedToId: null,
        },
      }),
      this.prisma.ticket.findMany({
        where: { status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } },
        select: { priority: true, createdAt: true },
      }),
      this.prisma.aiLog.findMany({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.aiLog.findMany(),
    ]);

    // Count SLA breached
    const nowMs = Date.now();
    let breachedSlaCount = 0;
    for (const t of allUnresolved) {
      const ageHours = (nowMs - t.createdAt.getTime()) / (1000 * 60 * 60);
      const threshold = SLA_HOURS[t.priority] || 72;
      if (ageHours > threshold) {
        breachedSlaCount++;
      }
    }

    // AI Usage computations
    const aiCallsToday = aiLogsToday.length;
    const aiTokensToday = aiLogsToday.reduce((acc, log) => acc + log.inputTokens + log.outputTokens, 0);
    const aiCostTodayUsd = aiLogsToday.reduce((acc, log) => acc + log.estimatedCostUsd, 0);

    const totalAiCalls = totalAiLogs.length;
    const failedAiCalls = totalAiLogs.filter((l) => !l.success).length;
    const aiFailureRatePct = totalAiCalls > 0 ? Number(((failedAiCalls / totalAiCalls) * 100).toFixed(1)) : 0;

    return {
      queue: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        unassigned: unassignedTickets,
        breachedSla: breachedSlaCount,
        resolved: totalTickets - openTickets - inProgressTickets,
      },
      aiUsage: {
        callsToday: aiCallsToday,
        tokensToday: aiTokensToday,
        estimatedCostTodayUsd: Number(aiCostTodayUsd.toFixed(4)),
        totalCalls: totalAiCalls,
        failureRatePct: aiFailureRatePct,
        activeProvider: process.env.AI_PROVIDER || 'anthropic',
        activeModel: process.env.AI_MODEL || 'claude-3-5-haiku-20241022',
      },
    };
  }
}
