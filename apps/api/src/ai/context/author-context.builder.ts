import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { computeRoyaltyCycle, ComputedRoyaltyFacts } from './royalty-cycle';

export interface BuiltAuthorContext {
  authorFirstName: string;
  bookContextText: string;
  computedFactsText: string;
  computedFacts: ComputedRoyaltyFacts | null;
  bookSnapshotHash: string;
}

@Injectable()
export class AuthorContextBuilder {
  constructor(private readonly prisma: PrismaService) {}

  async buildContext(authorId: string, bookId?: string | null): Promise<BuiltAuthorContext> {
    const author = await this.prisma.author.findUnique({
      where: { id: authorId },
      include: {
        books: true,
      },
    });

    if (!author) {
      throw new Error(`Author with id ${authorId} not found`);
    }

    // Security: use only first name, never pass email or phone to LLM
    const authorFirstName = author.name.split(' ')[0] || 'Author';

    let bookContextText = '';
    let computedFacts: ComputedRoyaltyFacts | null = null;
    let computedFactsText = '';
    let snapshotContent = '';

    if (bookId) {
      const book = author.books.find((b) => b.id === bookId);
      if (book) {
        computedFacts = computeRoyaltyCycle(
          book.royaltyPending || 0,
          book.lastRoyaltyPayoutDate,
          book.publicationDate,
        );

        bookContextText = [
          `Title: "${book.title}" (ISBN: ${book.isbn || 'Pending'})`,
          `Production/Catalog Status: ${book.status}`,
          `Publication Date: ${book.publicationDate ? book.publicationDate.toISOString().split('T')[0] : 'In Production / Not Yet Published'}`,
          `MRP: ${book.mrp ? '₹' + book.mrp : 'Not yet set'}`,
          `Author Royalty Per Copy: ${book.royaltyPerCopy ? '₹' + book.royaltyPerCopy : 'Not yet set'}`,
          `Total Copies Sold: ${book.totalCopiesSold}`,
          `Total Royalty Earned: ₹${book.totalRoyaltyEarned}`,
          `Royalty Paid to Date: ₹${book.royaltyPaid}`,
          `Royalty Currently Pending: ₹${book.royaltyPending}`,
          `Last Payout Date: ${book.lastRoyaltyPayoutDate ? book.lastRoyaltyPayoutDate.toISOString().split('T')[0] : 'No payouts yet'}`,
          `Print Partner: ${book.printPartner || 'In-House'}`,
          `Available Platforms: ${book.availableOn.length ? book.availableOn.join(', ') : 'None yet (in production)'}`,
        ].join('\n');

        snapshotContent = `${book.id}_${book.status}_${book.royaltyPending}_${book.totalCopiesSold}`;
      }
    } else {
      // General / Account-level query across all books
      const totalEarned = author.books.reduce((acc, b) => acc + (b.totalRoyaltyEarned || 0), 0);
      const totalPaid = author.books.reduce((acc, b) => acc + (b.royaltyPaid || 0), 0);
      const totalPending = author.books.reduce((acc, b) => acc + (b.royaltyPending || 0), 0);
      const totalSold = author.books.reduce((acc, b) => acc + (b.totalCopiesSold || 0), 0);

      computedFacts = computeRoyaltyCycle(totalPending, null, null);

      bookContextText = [
        `Account Scope: General / All Titles (${author.books.length} book(s) registered)`,
        `Titles: ${author.books.map((b) => `"${b.title}" [${b.status}]`).join('; ')}`,
        `Aggregate Lifetime Copies Sold: ${totalSold}`,
        `Aggregate Royalty Earned: ₹${totalEarned}`,
        `Aggregate Royalty Paid: ₹${totalPaid}`,
        `Aggregate Royalty Pending: ₹${totalPending}`,
      ].join('\n');

      snapshotContent = `${author.id}_all_${totalPending}_${totalSold}`;
    }

    if (computedFacts) {
      computedFactsText = [
        `Current Royalty Quarter: ${computedFacts.currentQuarter}`,
        `Quarter End Date: ${computedFacts.quarterEndDate}`,
        `Payout Deadline (45-Day Window): ${computedFacts.payoutDeadline}`,
        `Next Scheduled Payout Date: ${computedFacts.nextPayoutDate}`,
        `Pending Below Minimum Threshold (₹1,000): ${computedFacts.isBelowMinimumThreshold ? 'YES (rolls over to next quarter)' : 'NO'}`,
        `Payout Overdue Status: ${computedFacts.isPayoutOverdue ? 'YES (requires urgent investigation/escalation within 48h)' : 'NO'}`,
        `Months Since Publication: ${computedFacts.monthsSincePublication !== null ? computedFacts.monthsSincePublication + ' months' : 'N/A'}`,
      ].join('\n');
    }

    return {
      authorFirstName,
      bookContextText,
      computedFactsText,
      computedFacts,
      bookSnapshotHash: snapshotContent,
    };
  }
}
