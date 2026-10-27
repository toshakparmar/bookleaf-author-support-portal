import { Category, Priority } from '@prisma/client';
import { evaluatePriorityRules } from './priority-rules';
import { ClassificationResult } from '../schemas/ai.schemas';

interface KeywordRule {
  category: Category;
  keywords: string[];
  weight: number;
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    category: Category.ROYALTY_PAYMENTS,
    keywords: ['royalty', 'royalties', 'payout', 'payouts', 'payment', 'paid', 'bank transfer', 'sales report', 'earnings', 'split', 'deduction', 'threshold', '₹'],
    weight: 2,
  },
  {
    category: Category.ISBN_METADATA,
    keywords: ['isbn', 'barcode', 'imprint', 'metadata', 'listing title', 'author name spelling', 'book code', 'copyright page'],
    weight: 3,
  },
  {
    category: Category.PRINTING_QUALITY,
    keywords: ['print', 'printing', 'binding', 'cover finish', 'blurry', 'smudged', 'pages falling', 'paper quality', 'reprint', 'author copies', 'defective'],
    weight: 2.5,
  },
  {
    category: Category.DISTRIBUTION_AVAILABILITY,
    keywords: ['amazon', 'flipkart', 'unavailable', 'out of stock', 'buy button', 'distribution', 'platforms', 'delivery', 'sync', 'kindle', 'store'],
    weight: 2,
  },
  {
    category: Category.BOOK_STATUS_PRODUCTION,
    keywords: ['typesetting', 'proofreading', 'cover design', 'editing', 'production', 'manuscript', 'formatting', 'interior', 'proof', 'stage', 'timeline'],
    weight: 2,
  },
];

export function classifyByKeywords(
  subject: string,
  description: string,
  bookStatus?: string | null,
): ClassificationResult {
  const combinedText = `${subject} ${description}`.toLowerCase();
  const scores: Record<Category, number> = {
    [Category.ROYALTY_PAYMENTS]: 0,
    [Category.ISBN_METADATA]: 0,
    [Category.PRINTING_QUALITY]: 0,
    [Category.DISTRIBUTION_AVAILABILITY]: 0,
    [Category.BOOK_STATUS_PRODUCTION]: 0,
    [Category.GENERAL_INQUIRY]: 0.5, // Base prior
  };

  const detectedSignals: string[] = [];

  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (combinedText.includes(kw)) {
        scores[rule.category] += rule.weight;
        detectedSignals.push(`kw:${kw}`);
      }
    }
  }

  // If book status indicates production and production keywords appear
  if (bookStatus && bookStatus.toLowerCase().includes('production')) {
    scores[Category.BOOK_STATUS_PRODUCTION] += 1.5;
  }

  // Pick category with highest score
  let bestCategory: Category = Category.GENERAL_INQUIRY;
  let maxScore = scores[Category.GENERAL_INQUIRY];

  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat as Category;
    }
  }

  // Default baseline priority is MEDIUM
  const basePriority = Priority.MEDIUM;
  const evaluation = evaluatePriorityRules(basePriority, bestCategory, subject, description);

  return {
    category: bestCategory,
    priority: evaluation.finalPriority,
    confidence: maxScore > 2 ? 0.75 : 0.5,
    reasoning: `Rule-based classifier matched keywords (${detectedSignals.slice(0, 3).join(', ') || 'fallback default'})`,
    signals: detectedSignals.slice(0, 5),
  };
}
