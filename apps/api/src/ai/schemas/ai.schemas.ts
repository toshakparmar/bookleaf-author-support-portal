import { z } from 'zod';
import { Category, Priority } from '@prisma/client';

function normalizeCategory(val: unknown): Category {
  if (typeof val !== 'string') return Category.GENERAL_INQUIRY;
  const clean = val.toUpperCase().replace(/[\s\-_&/]+/g, '_');
  if (Object.values(Category).includes(clean as Category)) {
    return clean as Category;
  }
  if (clean.includes('ROYALTY') || clean.includes('PAYMENT')) return Category.ROYALTY_PAYMENTS;
  if (clean.includes('BOOK_STATUS') || clean.includes('PRODUCTION') || clean.includes('MANUSCRIPT') || clean.includes('STATUS')) {
    return Category.BOOK_STATUS_PRODUCTION;
  }
  if (clean.includes('PRINT') || clean.includes('QUALITY') || clean.includes('DEFECT') || clean.includes('DAMAGE')) {
    return Category.PRINTING_QUALITY;
  }
  if (clean.includes('DISTRIBUT') || clean.includes('AVAILAB') || clean.includes('STOCK') || clean.includes('AMAZON') || clean.includes('FLIPKART')) {
    return Category.DISTRIBUTION_AVAILABILITY;
  }
  if (clean.includes('ISBN') || clean.includes('METADATA') || clean.includes('BARCODE')) {
    return Category.ISBN_METADATA;
  }
  return Category.GENERAL_INQUIRY;
}

function normalizePriority(val: unknown): Priority {
  if (typeof val !== 'string') return Priority.MEDIUM;
  const clean = val.toUpperCase().trim();
  if (Object.values(Priority).includes(clean as Priority)) {
    return clean as Priority;
  }
  if (clean.includes('CRIT') || clean.includes('URGENT') || clean.includes('EMERGENCY')) return Priority.CRITICAL;
  if (clean.includes('HIGH')) return Priority.HIGH;
  if (clean.includes('LOW')) return Priority.LOW;
  return Priority.MEDIUM;
}

function normalizeSuggestedStatus(val: unknown): 'IN_PROGRESS' | 'RESOLVED' {
  if (typeof val === 'string' && val.toUpperCase().includes('RESOLV')) {
    return 'RESOLVED';
  }
  return 'IN_PROGRESS';
}

export const ClassificationResultSchema = z.object({
  category: z.preprocess(normalizeCategory, z.nativeEnum(Category)),
  priority: z.preprocess(normalizePriority, z.nativeEnum(Priority)),
  confidence: z.coerce.number().min(0).max(1).default(0.85),
  reasoning: z.string().default('Classified based on ticket description'),
  signals: z.array(z.string()).default([]),
});

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

export const DraftResultSchema = z.object({
  draft: z.string().min(20, 'Draft response too short'),
  flags: z.array(z.string()).default([]),
  suggestedStatus: z.preprocess(normalizeSuggestedStatus, z.enum(['IN_PROGRESS', 'RESOLVED'])).default('IN_PROGRESS'),
});

export type DraftResult = z.infer<typeof DraftResultSchema>;
