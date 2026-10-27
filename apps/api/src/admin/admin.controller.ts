import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { AiService } from '../ai/ai.service';
import { AdminTicketsQueryDto } from './dto/admin-tickets-query.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateAdminReplyDto } from './dto/create-admin-reply.dto';
import { CreateInternalNoteDto } from './dto/create-internal-note.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly aiService: AiService,
  ) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Admin ticket queue with search, SLA breach flags, filters, and urgency sort' })
  @ApiResponse({ status: 200, description: 'Ticket queue retrieved' })
  async getQueue(
    @Query() query: AdminTicketsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.getTicketsQueue(query, user.id);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Full ticket detail with conversation, author context, book data, and audit timeline' })
  @ApiResponse({ status: 200, description: 'Ticket detail retrieved' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketDetail(@Param('id') id: string) {
    return this.adminService.getTicketDetail(id);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update ticket status, category, priority, or assignee (records overrides)' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  async updateTicket(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.adminService.updateTicket(id, user.id, dto);
  }

  @Post('tickets/:id/assign-to-me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Self-assign ticket to current admin' })
  @ApiResponse({ status: 200, description: 'Ticket assigned' })
  async assignToMe(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.assignToMe(id, user.id);
  }

  @Post('tickets/:id/notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add staff-only internal note (never visible to authors)' })
  @ApiResponse({ status: 201, description: 'Note created' })
  async addInternalNote(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInternalNoteDto,
  ) {
    return this.adminService.addInternalNote(id, user.id, dto);
  }

  @Post('tickets/:id/replies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send reply to author (auto transitions OPEN to IN_PROGRESS)' })
  @ApiResponse({ status: 201, description: 'Reply sent' })
  async sendReply(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAdminReplyDto,
  ) {
    return this.adminService.sendReply(id, user.id, dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('tickets/:id/ai/classify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-run AI classification and priority on demand' })
  @ApiResponse({ status: 200, description: 'Classification completed' })
  async classifyTicket(@Param('id') id: string) {
    return this.aiService.classifyTicket(id);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('tickets/:id/ai/draft')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate or regenerate cached AI response draft' })
  @ApiQuery({ name: 'force', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Draft generated or retrieved from cache' })
  async generateDraft(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('force') force?: boolean,
  ) {
    return this.aiService.generateDraft(id, user.id, Boolean(force));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Admin summary stat cards and AI usage metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
