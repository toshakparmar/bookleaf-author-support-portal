import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCode } from '../common/errors/error-codes';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyBooks(authorId: string) {
    const books = await this.prisma.book.findMany({
      where: { authorId },
      orderBy: [
        { publicationDate: { sort: 'desc', nulls: 'last' } },
        { title: 'asc' },
      ],
    });

    const summary = books.reduce(
      (acc, b) => {
        acc.totalEarned += b.totalRoyaltyEarned || 0;
        acc.totalPaid += b.royaltyPaid || 0;
        acc.totalPending += b.royaltyPending || 0;
        acc.totalCopiesSold += b.totalCopiesSold || 0;
        return acc;
      },
      { totalEarned: 0, totalPaid: 0, totalPending: 0, totalCopiesSold: 0 },
    );

    return {
      books,
      summary,
    };
  }

  async getMyBookById(authorId: string, bookId: string) {
    const book = await this.prisma.book.findFirst({
      where: {
        id: bookId,
        authorId, // Strict tenancy filter
      },
    });

    if (!book) {
      // 404 instead of 403 to avoid resource leakage
      throw new NotFoundException({
        code: ErrorCode.BOOK_NOT_FOUND,
        message: 'Book not found',
      });
    }

    return book;
  }
}
