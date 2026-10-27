import { z } from 'zod';
import { Category, Priority } from '@prisma/client';

export const ClassificationResultSchema = z.object({
  category: z.nativeEnum(Category),
  priority: z.nativeEnum(Priority),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().max(300),
  signals: z.array(z.string()).default([]),
});

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

export const DraftResultSchema = z.object({
  draft: z.string().min(20, 'Draft response too short'),
  flags: z.array(z.string()).default([]),
  suggestedStatus: z.enum(['IN_PROGRESS', 'RESOLVED']).nullable().default(null),
});

export type DraftResult = z.infer<typeof DraftResultSchema>;
