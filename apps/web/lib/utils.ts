import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers in Indian numbering grouping (e.g. ₹11,970 or ₹1,25,000).
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date nicely (e.g. 15 Oct 2025).
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format human friendly age (e.g. "3d 4h", "5h 12m", "15m").
 */
export function formatRelativeAge(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const now = Date.now();
  const diffMs = Math.max(0, now - d.getTime());
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remHours = diffHours % 24;
    return `${diffDays}d ${remHours}h ago`;
  }
  if (diffHours > 0) {
    const remMins = diffMins % 60;
    return `${diffHours}h ${remMins}m ago`;
  }
  return `${Math.max(1, diffMins)}m ago`;
}

/**
 * Sequential production stages defined by BookLeaf Publishing.
 */
export const PRODUCTION_STAGES = [
  'Manuscript Received',
  'Editing',
  'Cover Design',
  'Typesetting',
  'Proofreading',
  'ISBN Assignment',
  'Printing',
  'Distribution Setup',
  'Published & Live',
];

/**
 * Determines stage index (0-8) based on status string.
 */
export function getProductionStageIndex(status: string | null | undefined): number {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes('published') || s.includes('live')) return 8;
  if (s.includes('distribution')) return 7;
  if (s.includes('printing')) return 6;
  if (s.includes('isbn')) return 5;
  if (s.includes('proofreading') || s.includes('proof')) return 4;
  if (s.includes('typesetting')) return 3;
  if (s.includes('cover')) return 2;
  if (s.includes('editing')) return 1;
  return 0;
}
