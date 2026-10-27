'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';
import { formatINR, formatDate } from '../../../lib/utils';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { ProductionStepper } from '../../../components/shared/ProductionStepper';
import { SpotlightCard } from '../../../components/reactbits/SpotlightCard';
import { CountUp } from '../../../components/reactbits/CountUp';
import { EmptyState } from '../../../components/shared/EmptyState';
import {
  PlusCircle,
  ArrowUpRight,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

const GENRE_SPINE_COLORS: Record<string, string> = {
  Fiction: '#1F5F4A',
  Poetry: '#96607E',
  'Non-Fiction': '#3E6FA8',
  Memoir: '#D98E04',
  Thriller: '#C8453A',
  Romance: '#B85D75',
};

export default function MyBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApi('/authors/me/books')
      .then((data) => {
        setBooks(data.books || []);
        setSummary(data.summary || {});
      })
      .catch((err) => {
        setError(err.message || 'Failed to load your book catalog');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-40 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-40 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
        <p className="font-semibold text-sm">Unable to load catalog</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  const totalEarned = summary?.totalEarned || 0;
  const totalPaid = summary?.totalPaid || 0;
  const totalPending = summary?.totalPending || 0;
  const paidPercent = totalEarned > 0 ? (totalPaid / totalEarned) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <PageHeader
        title="Your Published Catalog"
        description="Monitor book production stages, ISBN registrations, and net profit royalties calculated quarterly."
        action={
          <Link
            href="/author/tickets/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover shadow-subtle transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Raise Query</span>
          </Link>
        }
      />

      {/* Summary Strip: Total Earned / Paid / Pending with Stacked Bar */}
      {summary && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-5 border-b border-border">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                Total Royalty Earned
              </span>
              <div className="font-display text-2xl sm:text-3xl font-medium text-foreground mt-1">
                <CountUp to={totalEarned} formatter={(v) => formatINR(v)} />
              </div>
              <span className="text-[11px] text-muted-foreground/80 mt-1 block">
                80% author share of net profits
              </span>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                Royalty Paid to Date
              </span>
              <div className="font-display text-2xl sm:text-3xl font-medium text-primary mt-1">
                <CountUp to={totalPaid} formatter={(v) => formatINR(v)} />
              </div>
              <span className="text-[11px] text-muted-foreground/80 mt-1 block">
                Directly transferred to linked bank account
              </span>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-accent block font-medium">
                Royalty Pending Payout
              </span>
              <div className="font-display text-2xl sm:text-3xl font-medium text-accent mt-1">
                <CountUp to={totalPending} formatter={(v) => formatINR(v)} />
              </div>
              <span className="text-[11px] text-muted-foreground/80 mt-1 block">
                Processed within 45 days of quarter end
              </span>
            </div>
          </div>

          {/* Thin Stacked Progress Bar */}
          <div className="pt-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
              <span>Payout Progress ({Math.round(paidPercent)}% Paid)</span>
              <span>
                {formatINR(totalPaid)} of {formatINR(totalEarned)}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${paidPercent}%` }}
              />
              <div
                className="h-full bg-accent transition-all duration-700"
                style={{ width: `${100 - paidPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Book Catalog List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-foreground tracking-tight">
            Registered Titles ({books.length})
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            Lifetime Sold: {summary?.totalCopiesSold?.toLocaleString('en-IN') || 0} copies
          </span>
        </div>

        {books.length === 0 ? (
          <EmptyState
            title="No Titles in Catalog"
            description="You do not have any published books or active manuscripts in production yet."
            action={
              <Link
                href="/author/tickets/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Contact Editorial Desk</span>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {books.map((book) => {
              const inProduction = book.status.toLowerCase().includes('production');
              const isPendingBelowThreshold =
                book.royaltyPending > 0 && book.royaltyPending < 1000;
              const spineColor =
                GENRE_SPINE_COLORS[book.genre] || '#1F5F4A';

              return (
                <SpotlightCard
                  key={book.id}
                  className="p-0 border-border bg-card overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Spine colored edge */}
                    <div
                      className="w-full sm:w-2 shrink-0 h-1 sm:h-auto"
                      style={{ backgroundColor: spineColor }}
                    />

                    <div className="p-6 flex-1">
                      {/* Top Row: Title, Codes, Status, Query shortcut */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-display text-xl font-medium text-foreground">
                              {book.title}
                            </h3>
                            <StatusBadge status={book.status} />
                            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                              {book.bookCode}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-1.5 flex-wrap">
                            <span>
                              Genre: <strong className="text-foreground font-sans">{book.genre}</strong>
                            </span>
                            <span>&middot;</span>
                            <span>
                              ISBN:{' '}
                              <strong className="text-foreground font-mono">
                                {book.isbn || 'Pending Assignment'}
                              </strong>
                            </span>
                            <span>&middot;</span>
                            <span>
                              Date:{' '}
                              <strong className="text-foreground font-sans">
                                {book.publicationDate ? formatDate(book.publicationDate) : 'In Production'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/author/tickets/new?bookId=${book.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline shrink-0"
                        >
                          <span>Ask about this book</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Production Stepper for in-production titles */}
                      {inProduction && (
                        <div className="mt-5 pt-4 border-t border-border">
                          <ProductionStepper currentStageName={book.status} />
                        </div>
                      )}

                      {/* 4-Metric Grid (MRP, Sold, Earned, Pending) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-border text-xs">
                        <div>
                          <span className="text-muted-foreground block font-mono text-[11px] uppercase">
                            MRP
                          </span>
                          <span className="font-mono text-sm font-medium text-foreground mt-0.5 block">
                            {book.mrp ? `₹${book.mrp}` : <em className="text-muted-foreground">Not yet set</em>}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block font-mono text-[11px] uppercase">
                            Copies Sold
                          </span>
                          <span className="font-mono text-sm font-medium text-foreground mt-0.5 block">
                            {book.totalCopiesSold?.toLocaleString('en-IN') || 0}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block font-mono text-[11px] uppercase">
                            Total Earned
                          </span>
                          <span className="font-mono text-sm font-medium text-foreground mt-0.5 block">
                            {formatINR(book.totalRoyaltyEarned)}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-foreground block font-mono text-[11px] uppercase">
                            Pending Payout
                          </span>
                          <span className="font-mono text-sm font-medium text-accent mt-0.5 block">
                            {formatINR(book.royaltyPending)}
                          </span>
                        </div>
                      </div>

                      {/* Bottom strip: platforms and payout alerts */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                        {isPendingBelowThreshold ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-accent">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Pending balance ({formatINR(book.royaltyPending)}) is below ₹1,000 minimum — rolls over to next quarter.
                            </span>
                          </div>
                        ) : book.royaltyPaid === 0 && book.totalCopiesSold > 0 ? (
                          <span className="text-muted-foreground text-[11px]">
                            Last Payout: <strong className="text-foreground">No payouts yet (scheduled next quarter)</strong>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            Last Payout Date: <strong className="text-foreground">{formatDate(book.lastRoyaltyPayoutDate)}</strong>
                          </span>
                        )}

                        {/* Platform chips */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {book.availableOn && book.availableOn.length > 0 ? (
                            book.availableOn.map((plat: string) => (
                              <span
                                key={plat}
                                className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-border bg-muted/40 text-muted-foreground"
                              >
                                {plat}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-mono text-muted-foreground italic">
                              Distribution: Pending Launch
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
