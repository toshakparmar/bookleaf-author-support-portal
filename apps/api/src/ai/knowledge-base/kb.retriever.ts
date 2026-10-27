import { Injectable, Logger } from '@nestjs/common';
import { Category } from '@prisma/client';
import { BOOKLEAF_KB, KbExample } from './kb';

export interface RetrievedKbContext {
  formattedText: string;
  includedSections: string[];
  exampleQuery?: string;
  approxTokens: number;
}

@Injectable()
export class KbRetriever {
  private readonly logger = new Logger(KbRetriever.name);

  retrieveForTicket(category: Category, ticketText: string): RetrievedKbContext {
    const includedSections: string[] = ['tone'];
    const sections: string[] = [];

    // 1. Tone is always included (compact)
    sections.push(`### Tone & Voice Guidelines:\n${BOOKLEAF_KB.tone.content}`);

    // 2. Select category-scoped section
    switch (category) {
      case Category.ROYALTY_PAYMENTS:
        sections.push(`### Royalty Policy:\n${BOOKLEAF_KB.royalty.content}`);
        includedSections.push('royalty');
        break;
      case Category.ISBN_METADATA:
        sections.push(`### ISBN & Metadata Policy:\n${BOOKLEAF_KB.isbn.content}`);
        includedSections.push('isbn');
        break;
      case Category.PRINTING_QUALITY:
        sections.push(`### Printing & Quality Policy:\n${BOOKLEAF_KB.printing.content}`);
        includedSections.push('printing');
        break;
      case Category.DISTRIBUTION_AVAILABILITY:
        sections.push(`### Distribution & Platform Policy:\n${BOOKLEAF_KB.distribution.content}`);
        includedSections.push('distribution');
        break;
      case Category.BOOK_STATUS_PRODUCTION:
        sections.push(`### Production Stages & Timelines:\n${BOOKLEAF_KB.production.content}`);
        includedSections.push('production');
        break;
      case Category.GENERAL_INQUIRY:
      default:
        sections.push(`### Company Overview:\n${BOOKLEAF_KB.company.content}`);
        includedSections.push('company');
        break;
    }

    // If query mentions royalty/payout/money and royalty wasn't already added, add it
    const lower = ticketText.toLowerCase();
    if (
      !includedSections.includes('royalty') &&
      (lower.includes('royalty') || lower.includes('payout') || lower.includes('₹') || lower.includes('money') || lower.includes('paid'))
    ) {
      sections.push(`### Royalty Policy:\n${BOOKLEAF_KB.royalty.content}`);
      includedSections.push('royalty');
    }

    // 3. Match exactly 1 relevant few-shot example
    const matchingExample =
      BOOKLEAF_KB.examples.find((e) => e.category === category) ||
      BOOKLEAF_KB.examples[0];

    sections.push(
      `### Reference Case Study (${matchingExample.category}):\n` +
      `Scenario: "${matchingExample.query}"\n` +
      `Expected Action: ${matchingExample.expectedBehavior}`,
    );

    const formattedText = sections.join('\n\n');
    // Approximate token count (~4 chars per token)
    const approxTokens = Math.ceil(formattedText.length / 4);

    this.logger.debug(
      `KB retrieved sections [${includedSections.join(', ')}] with approx ${approxTokens} tokens for category ${category}`,
    );

    return {
      formattedText,
      includedSections,
      exampleQuery: matchingExample.query,
      approxTokens,
    };
  }
}
