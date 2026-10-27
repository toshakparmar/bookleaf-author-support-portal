import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BooksService } from '../books/books.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { ErrorCode } from '../common/errors/error-codes';

@ApiTags('authors')
@ApiBearerAuth()
@Roles(Role.AUTHOR)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly booksService: BooksService) {}

  @Get('me/books')
  @ApiOperation({ summary: 'Get all books and royalty summary for current author' })
  @ApiResponse({ status: 200, description: 'Author books retrieved' })
  async getMyBooks(@CurrentUser() user: AuthenticatedUser) {
    if (!user.authorId) {
      throw new NotFoundException({
        code: ErrorCode.AUTHOR_NOT_FOUND,
        message: 'No author profile associated with this account',
      });
    }
    return this.booksService.getMyBooks(user.authorId);
  }

  @Get('me/books/:bookId')
  @ApiOperation({ summary: 'Get details of a single book belonging to current author' })
  @ApiResponse({ status: 200, description: 'Book details retrieved' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async getMyBook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookId') bookId: string,
  ) {
    if (!user.authorId) {
      throw new NotFoundException({
        code: ErrorCode.AUTHOR_NOT_FOUND,
        message: 'No author profile associated with this account',
      });
    }
    return this.booksService.getMyBookById(user.authorId, bookId);
  }
}
