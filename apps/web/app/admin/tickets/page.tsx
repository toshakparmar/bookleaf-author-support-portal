'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { formatDate, formatRelativeAge } from '../../../lib/utils';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { CategoryTag } from '../../../components/shared/CategoryTag';
import { SlaBadge } from '../../../components/shared/SlaBadge';
import { AdminStatCard } from '../../../components/admin/AdminStatCard';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useTicketStream, TicketStreamEvent } from '../../../lib/useTicketStream';
import {
  Inbox,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  UserX,
  UserCheck,
  Cpu,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

function AdminQueueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlAssignee = searchParams?.get('assignee')?.toLowerCase() || 'all';
  const urlSlaBreached = searchParams?.get('slaBreached') === 'true';

  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [meta, setMeta] = useState<any>({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState(urlAssignee);
  const [search, setSearch] = useState('');
  const [slaBreachedOnly, setSlaBreachedOnly] = useState(urlSlaBreached);
  const [sort, setSort] = useState('urgency');
  const [page, setPage] = useState(1);

  // Synchronize state when URL search parameters change (sidebar navigation)
  useEffect(() => {
    setAssignee(urlAssignee);
    setSlaBreachedOnly(urlSlaBreached);
    setPage(1);
  }, [urlAssignee, urlSlaBreached]);

  const updateFilterParam = (key: string, val: string | boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (key === 'assignee') {
      if (val && val !== 'all') {
        params.set('assignee', String(val));
      } else {
        params.delete('assignee');
      }
    } else if (key === 'slaBreached') {
      if (val) {
        params.set('slaBreached', 'true');
      } else {
        params.delete('slaBreached');
      }
    }
    router.push(`/admin/tickets?${params.toString()}`);
  };

  // Live incoming tickets indicator
  const [newTicketsCount, setNewTicketsCount] = useState(0);

  const loadData = useCallback(() => {
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('pageSize', '20');
    q.set('sort', sort);
    if (status) q.set('status', status);
    if (category) q.set('category', category);
    if (priority) q.set('priority', priority);
    if (assignee) q.set('assignee', assignee);
    if (search.trim()) q.set('q', search.trim());
    if (slaBreachedOnly) q.set('slaBreached', 'true');

    Promise.all([
      fetchApi(`/admin/tickets?${q.toString()}`),
      fetchApi('/admin/stats'),
    ])
      .then(([queueRes, statsRes]) => {
        setTickets(queueRes.data || []);
        setMeta(queueRes.meta || {});
        setStats(statsRes);
        setNewTicketsCount(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status, category, priority, assignee, search, slaBreachedOnly, sort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates via SSE
  useTicketStream(
    useCallback(
      (event: TicketStreamEvent) => {
        if (event.type === 'ticket.created') {
          setNewTicketsCount((c) => c + 1);
        } else if (event.type === 'ticket.updated' || event.type === 'ticket.ai_ready') {
          loadData();
        }
      },
      [loadData]
    )
  );

  const handleSelfAssign = async (e: React.MouseEvent, ticketId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetchApi(`/admin/tickets/${ticketId}/assign-to-me`, { method: 'POST' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign ticket');
    }
  };

  const hasActiveFilters = Boolean(
    status || category || priority || assignee !== 'all' || search || slaBreachedOnly
  );

  const clearFilters = () => {
    setStatus('');
    setCategory('');
    setPriority('');
    setAssignee('all');
    setSearch('');
    setSlaBreachedOnly(false);
    setPage(1);
    router.push('/admin/tickets');
  };

  let queueTitle = 'Publishing Operations Queue';
  let queueDescription = 'AI-assisted triage, priority enforcement, SLA tracking, and automated response drafting.';
  let queueBadge = `${meta.total} Active Queries`;

  if (slaBreachedOnly) {
    queueTitle = 'Breached SLA Escalation Queue';
    queueDescription = 'Urgent queries exceeding the 48-hour SLA threshold requiring immediate supervisor intervention.';
    queueBadge = `${meta.total} Breached`;
  } else if (assignee === 'mine') {
    queueTitle = 'Assigned to Me';
    queueDescription = 'Queries designated to your desk for active investigation, author reply drafting, and resolution.';
    queueBadge = `${meta.total} Assigned to You`;
  } else if (assignee === 'unassigned') {
    queueTitle = 'Unassigned Triage Queue';
    queueDescription = 'Fresh incoming author queries awaiting an operations specialist or editorial lead.';
    queueBadge = `${meta.total} Unassigned`;
  }

  return (
    <div className="space-y-6">
      {/* Top Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-medium text-foreground tracking-tight">
              {queueTitle}
            </h1>
            <span
              className={`font-mono text-xs px-2.5 py-0.5 rounded-full border ${
                slaBreachedOnly
                  ? 'bg-destructive/10 text-destructive border-destructive/20 font-semibold'
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              {queueBadge}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            {queueDescription}
          </p>
        </div>

        <button
          onClick={() => loadData()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium shadow-subtle transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stat Cards & AI Usage Card */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <AdminStatCard
            label="Open Queries"
            value={stats.queue.open}
            subtext="Awaiting desk review"
            icon={Inbox}
          />

          <AdminStatCard
            label="In Progress"
            value={stats.queue.inProgress}
            subtext="Under active investigation"
            icon={Clock}
          />

          <AdminStatCard
            label="Unassigned"
            value={stats.queue.unassigned}
            subtext="Needs designated owner"
            icon={UserX}
          />

          <AdminStatCard
            label="Breached SLA"
            value={stats.queue.breachedSla}
            subtext="Exceeded resolution threshold"
            icon={AlertTriangle}
            variant="urgent"
          />

          {/* AI Usage Card */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-subtle flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI Triage
              </span>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                {stats.aiUsage.activeProvider}
              </span>
            </div>

            <div className="text-[11px] font-mono space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Calls Today:</span>
                <strong className="text-foreground">{stats.aiUsage.callsToday}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tokens:</span>
                <strong className="text-foreground">
                  {stats.aiUsage.tokensToday.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Est. Cost:</span>
                <strong className="text-primary font-semibold">
                  ${stats.aiUsage.estimatedCostTodayUsd}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live New Tickets Notification Banner */}
      {newTicketsCount > 0 && (
        <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-subtle flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-medium">
              {newTicketsCount} new support ticket(s) received via real-time stream.
            </span>
          </div>
          <button
            onClick={() => loadData()}
            className="px-3 py-1 rounded bg-card text-foreground font-semibold hover:bg-muted transition text-xs"
          >
            Update Queue View
          </button>
        </div>
      )}

      {/* Filter and Search Bar (Sticky) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ticket #, subject, author, or book..."
              className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-background border border-input rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Status: All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-background border border-input rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Category: All</option>
            <option value="ROYALTY_PAYMENTS">Royalty &amp; Payouts</option>
            <option value="ISBN_METADATA">ISBN &amp; Metadata</option>
            <option value="PRINTING_QUALITY">Printing Quality</option>
            <option value="DISTRIBUTION_AVAILABILITY">Distribution &amp; Stock</option>
            <option value="BOOK_STATUS_PRODUCTION">Production Status</option>
            <option value="GENERAL_INQUIRY">General Inquiry</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="bg-background border border-input rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Priority: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assignee}
            onChange={(e) => {
              setAssignee(e.target.value);
              setPage(1);
              updateFilterParam('assignee', e.target.value);
            }}
            className="bg-background border border-input rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">Assignee: All</option>
            <option value="mine">Assigned to Me</option>
            <option value="unassigned">Unassigned Only</option>
          </select>
        </div>

        {/* Quick Toggles: Sort, SLA breach, Clear filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground font-mono text-[11px] uppercase mr-1">
              Sort:
            </span>
            {[
              { id: 'urgency', label: 'Urgency (Default)' },
              { id: 'oldest', label: 'Oldest Unresolved' },
              { id: 'priority', label: 'Highest Priority' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSort(s.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  sort === s.id
                    ? 'bg-primary text-primary-foreground shadow-subtle'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-destructive">
              <input
                type="checkbox"
                checked={slaBreachedOnly}
                onChange={(e) => {
                  setSlaBreachedOnly(e.target.checked);
                  setPage(1);
                  updateFilterParam('slaBreached', e.target.checked);
                }}
                className="rounded border-destructive/40 text-destructive focus:ring-destructive/30"
              />
              <span>Breached SLA Only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Queue Table */}
      <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            <div className="h-8 bg-muted/40 rounded animate-pulse" />
            <div className="h-8 bg-muted/40 rounded animate-pulse" />
            <div className="h-8 bg-muted/40 rounded animate-pulse" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            type="inbox"
            title="Triage Queue is Clear"
            description="No tickets currently match the selected filter criteria."
            action={
              hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted text-xs font-medium transition"
                >
                  Reset Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Author &amp; Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA / Age</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-muted/30 transition group ${
                      t.isSlaBreached ? 'bg-destructive/5' : ''
                    }`}
                  >
                    {/* Ticket # Mono */}
                    <td className="py-3.5 px-4 font-mono font-medium whitespace-nowrap">
                      <Link
                        href={`/admin/tickets/${t.id}`}
                        className="hover:text-primary transition"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>

                    {/* Author & Subject */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        href={`/admin/tickets/${t.id}`}
                        className="font-medium text-foreground hover:text-primary block truncate"
                      >
                        {t.subject}
                      </Link>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1.5 truncate">
                        <span>{t.author?.name}</span>
                        {t.book && (
                          <>
                            <span>&middot;</span>
                            <span className="italic truncate font-sans text-muted-foreground">
                              {t.book.title}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Category Tag with Icon */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryTag category={t.category} />
                    </td>

                    {/* Priority Bar Variant */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} variant="bar" />
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>

                    {/* SLA / Age */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SlaBadge
                        isBreached={t.isSlaBreached}
                        remainingHours={t.slaRemainingHours}
                      />
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-muted border border-border text-foreground flex items-center justify-center font-display text-[10px]">
                            {t.assignedTo.name.charAt(0)}
                          </div>
                          <span className="text-xs text-foreground font-medium">
                            {t.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleSelfAssign(e, t.id)}
                          className="text-[11px] font-mono text-muted-foreground hover:text-primary underline"
                        >
                          Assign to me
                        </button>
                      )}
                    </td>

                    {/* Row Hover Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/tickets/${t.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card border border-border hover:bg-muted text-foreground text-xs font-medium transition"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>
              Page {page} of {meta.totalPages} ({meta.total} total tickets)
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
    </div>
  );
}

export default function AdminQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-64 bg-muted/40 rounded-xl animate-pulse" />
        </div>
      }
    >
      <AdminQueueContent />
    </Suspense>
  );
}
