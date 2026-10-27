'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../../lib/api';
import { formatDate, formatRelativeAge } from '../../../lib/utils';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { CategoryTag } from '../../../components/shared/CategoryTag';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useTicketStream } from '../../../lib/useTicketStream';
import {
  PlusCircle,
  Clock,
  BookOpen,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export default function AuthorTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(() => {
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('pageSize', '15');
    if (statusFilter) q.set('status', statusFilter);

    fetchApi(`/tickets?${q.toString()}`)
      .then((res) => {
        setTickets(res.data || []);
        setMeta(res.meta || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useTicketStream(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  const filterTabs = [
    { label: 'All Queries', value: '' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support &amp; Editorial Queries"
        description="Review active correspondence with operations specialists regarding ISBN assignment, printing, and royalties."
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

      {/* Filter Tabs with hairline underline */}
      <div className="flex items-center gap-1 border-b border-border pb-1 overflow-x-auto scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`relative px-3.5 py-2 text-xs font-medium transition-colors rounded-md ${
                isActive
                  ? 'text-foreground font-semibold bg-card border border-border shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          type="inbox"
          title="No Queries Found"
          description={
            statusFilter
              ? `You do not have any tickets matching the ${statusFilter.replace('_', ' ')} filter.`
              : 'You have not submitted any editorial or royalty support inquiries yet.'
          }
          action={
            <Link
              href="/author/tickets/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit First Query</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden divide-y divide-border">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/author/tickets/${t.id}`}
              className="p-5 block hover:bg-muted/30 transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                      {t.ticketNumber}
                    </span>
                    <StatusBadge status={t.status} />
                    <CategoryTag category={t.category} />
                  </div>

                  <h3 className="font-display text-base font-medium text-foreground group-hover:text-primary transition">
                    {t.subject}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                    {t.book && (
                      <span className="flex items-center gap-1 text-foreground font-sans">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{t.book.title}</span>
                      </span>
                    )}
                    <span>&middot;</span>
                    <span>Logged: {formatDate(t.createdAt)}</span>
                    <span>&middot;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Active {formatRelativeAge(t.lastActivityAt)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:translate-x-0.5 transition shrink-0 self-end sm:self-center">
                  <span>View Thread</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-2">
          <span>
            Page {page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 transition"
            >
              Previous
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
