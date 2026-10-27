import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Role, TicketStatus } from '@prisma/client';
import { ErrorCode } from '../common/errors/error-codes';

@ApiTags('tickets')
@ApiBearerAuth()
@Roles(Role.AUTHOR)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 tickets per minute per author
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new support ticket (returns 201 immediately, triggers async AI triage)' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Referenced book not found' })
  async createTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTicketDto,
  ) {
    if (!user.authorId) {
      throw new NotFoundException({
        code: ErrorCode.AUTHOR_NOT_FOUND,
        message: 'No author profile associated with this account',
      });
    }
    return this.ticketsService.createTicket(user.authorId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tickets created by the logged-in author' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiResponse({ status: 200, description: 'Author tickets retrieved' })
  async getMyTickets(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: TicketStatus,
  ) {
    if (!user.authorId) {
      throw new NotFoundException({
        code: ErrorCode.AUTHOR_NOT_FOUND,
        message: 'No author profile associated with this account',
      });
    }
    return this.ticketsService.getAuthorTickets(
      user.authorId,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single ticket conversation thread for author' })
  @ApiResponse({ status: 200, description: 'Ticket thread retrieved' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getMyTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    if (!user.authorId) {
      throw new NotFoundException({
        code: ErrorCode.AUTHOR_NOT_FOUND,
        message: 'No author profile associated with this account',
      });
    }
    return this.ticketsService.getAuthorTicketById(user.authorId, id);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Author submits a follow-up reply to the ticket' })
  @ApiResponse({ status: 201, description: 'Reply added successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async addReply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    if (!user.authorId) {
      throw new NotFoundException({
        code: ErrorCode.AUTHOR_NOT_FOUND,
        message: 'No author profile associated with this account',
      });
    }
    return this.ticketsService.addAuthorReply(user.authorId, user.id, id, dto);
  }
}
