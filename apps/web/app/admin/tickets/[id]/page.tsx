'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '../../../../lib/api';
import { formatDate, formatINR, formatRelativeAge } from '../../../../lib/utils';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../../components/shared/PriorityBadge';
import { CategoryTag } from '../../../../components/shared/CategoryTag';
import { SlaBadge } from '../../../../components/shared/SlaBadge';
import { ShinyText } from '../../../../components/reactbits/ShinyText';
import { useTicketStream, TicketStreamEvent } from '../../../../lib/useTicketStream';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  Sparkles,
  RotateCw,
  Lock,
  Clock,
  BookOpen,
  User,
  History,
  AlertCircle,
  Paperclip,
  Check,
  UserCheck,
} from 'lucide-react';

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const router = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Controls
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Internal Notes
  const [internalNoteText, setInternalNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // AI Draft Response
  const [draftText, setDraftText] = useState('');
  const [draftFlags, setDraftFlags] = useState<string[]>([]);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [aiError, setAiError] = useState('');

  const loadTicketData = useCallback(() => {
    fetchApi(`/admin/tickets/${ticketId}`)
      .then((data) => {
        setTicket(data);
        setStatus(data.status);
        setCategory(data.category);
        setPriority(data.priority);

        // Preload latest draft if available
        if (data.drafts && data.drafts.length > 0) {
          setDraftText(data.drafts[0].body);
          setDraftFlags(data.drafts[0].flags || []);
        }
      })
      .catch((err) => setError(err.message || 'Ticket not found'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  // Auto-request draft on open if empty
  useEffect(() => {
    if (ticket && !draftText && !loadingDraft && !aiError) {
      handleGenerateDraft(false);
    }
  }, [ticket]);

  // Real-time stream
  useTicketStream(
    useCallback(
      (event: TicketStreamEvent) => {
        if (
          (event.type === 'ticket.message' ||
            event.type === 'ticket.updated' ||
            event.type === 'ticket.ai_ready') &&
          (event.payload.ticketId === ticketId || event.payload.id === ticketId)
        ) {
          loadTicketData();
        }
      },
      [ticketId, loadTicketData]
    )
  );

  const handleUpdate = async (field: 'status' | 'category' | 'priority', val: string) => {
    setUpdatingTicket(true);
    try {
      await fetchApi(`/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: val }),
      });
      toast.success(`Updated ticket ${field} to ${val}`);
      loadTicketData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await fetchApi(`/admin/tickets/${ticketId}/assign-to-me`, { method: 'POST' });
      toast.success('Assigned ticket to you');
      loadTicketData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign ticket');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;

    setAddingNote(true);
    try {
      await fetchApi(`/admin/tickets/${ticketId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body: internalNoteText.trim() }),
      });
      setInternalNoteText('');
      toast.success('Internal note recorded');
      loadTicketData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add internal note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleGenerateDraft = async (force = true) => {
    setLoadingDraft(true);
    setAiError('');
    try {
      const res = await fetchApi(`/admin/tickets/${ticketId}/ai/draft?force=${force}`, {
        method: 'POST',
      });
      setDraftText(res.draft);
      setDraftFlags(res.flags || []);
    } catch {
      setAiError('AI assistant unavailable. You can draft and send a manual response.');
    } finally {
      setLoadingDraft(false);
    }
  };

  const handleSendReply = async () => {
    if (!draftText.trim()) return;

    setSendingReply(true);
    try {
      await fetchApi(`/admin/tickets/${ticketId}/replies`, {
        method: 'POST',
        body: JSON.stringify({
          body: draftText.trim(),
          aiDraftId: ticket.drafts?.[0]?.id,
        }),
      });
      toast.success('Reply dispatched to author');
      setDraftText('');
      setDraftFlags([]);
      loadTicketData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-muted/40 rounded-xl animate-pulse" />
          <div className="lg:col-span-5 h-96 bg-muted/40 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="p-8 bg-card border border-border rounded-xl shadow-subtle">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <h2 className="font-display text-xl font-medium text-foreground">
            Ticket Not Found
          </h2>
          <p className="text-xs text-muted-foreground mt-1 mb-6">{error}</p>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg transition"
          >
            Back to Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tickets"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryTag category={ticket.category} />
              {ticket.isSlaBreached && <SlaBadge isBreached={true} />}
            </div>
            <h1 className="font-display text-lg sm:text-xl font-medium text-foreground mt-1">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Quick Assign to Me button */}
        {!ticket.assignedTo && (
          <button
            onClick={handleAssignToMe}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-semibold transition self-start sm:self-auto"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign to Me</span>
          </button>
        )}
      </div>

      {/* Two Column Layout (7 cols left, 5 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Thread + Live Context Panel + Audit Events (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Conversation Thread */}
          <div className="space-y-3.5">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Conversation Thread</span>
              <span>{ticket.messages?.length + 1} messages</span>
            </h2>

            {/* Author Original Query */}
            <div className="bg-card rounded-xl border border-border shadow-subtle p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted text-foreground flex items-center justify-center font-display text-[10px]">
                    {ticket.author?.name?.charAt(0) || 'A'}
                  </div>
                  <span className="font-medium text-foreground">
                    {ticket.author?.name} (Author)
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    [{ticket.author?.authorCode}]
                  </span>
                </div>
                <span className="font-mono text-[11px]">
                  {formatDate(ticket.createdAt)} ({formatRelativeAge(ticket.createdAt)})
                </span>
              </div>

              <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line font-sans">
                {ticket.description}
              </div>

              {ticket.attachmentMeta && (
                <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground font-medium">
                    {ticket.attachmentMeta.name}
                  </span>
                  {ticket.attachmentMeta.sizeBytes && (
                    <span className="font-mono text-[10px]">
                      ({Math.round(ticket.attachmentMeta.sizeBytes / 1024)} KB)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Admin and Author Replies */}
            {ticket.messages?.map((msg: any) => {
              const isAdmin = msg.sender === 'ADMIN';

              return (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-5 space-y-2.5 shadow-subtle transition ${
                    isAdmin
                      ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 ml-3'
                      : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-display text-[10px] font-semibold ${
                          isAdmin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {isAdmin ? 'BL' : 'A'}
                      </div>
                      <span
                        className={`font-medium ${
                          isAdmin ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {isAdmin
                          ? `${msg.senderUser?.name || 'Operations Specialist'} (BookLeaf)`
                          : ticket.author?.name}
                      </span>
                      {msg.wasAiDrafted && (
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded font-mono inline-flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> AI Drafted
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px]">{formatDate(msg.createdAt)}</span>
                  </div>

                  <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line font-sans">
                    {msg.body}
                  </div>
                </div>
              );
            })}
          </div>

          {/* LIVE CONTEXT PANEL: Database Facts */}
          <div className="bg-card rounded-xl border border-border shadow-subtle p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Live Database Context</span>
            </h3>

            {/* Author Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                  Author
                </span>
                <span className="font-medium text-foreground">{ticket.author?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                  Code
                </span>
                <span className="font-mono font-medium text-foreground">
                  {ticket.author?.authorCode}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                  City
                </span>
                <span className="font-medium text-foreground">{ticket.author?.city}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                  Joined
                </span>
                <span className="font-mono font-medium text-foreground">
                  {formatDate(ticket.author?.joinedDate)}
                </span>
              </div>
            </div>

            {/* Book Facts */}
            {ticket.book ? (
              <div className="pt-3 border-t border-border space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-medium text-foreground">
                    {ticket.book.title}
                  </span>
                  <StatusBadge status={ticket.book.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                      ISBN
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {ticket.book.isbn || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                      Pub Date
                    </span>
                    <span className="font-medium text-foreground">
                      {ticket.book.publicationDate ? formatDate(ticket.book.publicationDate) : 'In Production'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                      MRP
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {ticket.book.mrp ? `₹${ticket.book.mrp}` : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                      Copies Sold
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {ticket.book.totalCopiesSold}
                    </span>
                  </div>
                </div>

                {/* Royalty snapshot strip */}
                <div className="grid grid-cols-3 gap-3 bg-muted/40 p-3 rounded-lg border border-border text-xs">
                  <div>
                    <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                      Total Earned
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatINR(ticket.book.totalRoyaltyEarned)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                      Paid to Date
                    </span>
                    <span className="font-mono font-semibold text-primary">
                      {formatINR(ticket.book.royaltyPaid)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                      Pending Payout
                    </span>
                    <span className="font-mono font-semibold text-accent">
                      {formatINR(ticket.book.royaltyPending)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground italic">
                General inquiry &middot; No specific book attached to this ticket.
              </div>
            )}
          </div>

          {/* Audit Event Timeline */}
          <div className="bg-card rounded-xl border border-border shadow-subtle p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
              <History className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Audit Trail Timeline ({ticket.events?.length || 0})</span>
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2">
              {ticket.events?.map((evt: any) => (
                <div key={evt.id} className="text-xs flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-foreground">
                        {evt.type}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {formatRelativeAge(evt.createdAt)}
                      </span>
                    </div>
                    {evt.actor && (
                      <span className="text-[10px] text-muted-foreground">
                        By {evt.actor.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Controls + AI Response Assistant + Internal Notes (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* TICKET CONTROLS */}
          <div className="bg-card rounded-xl border border-border shadow-subtle p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5">
              Triage &amp; Queue Assignment
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Ticket Status
              </label>
              <select
                disabled={updatingTicket}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleUpdate('status', e.target.value);
                }}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Category Select with AI Suggested */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                {ticket.aiCategory && (
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    AI: {ticket.aiCategory}
                  </span>
                )}
              </div>
              <select
                disabled={updatingTicket}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  handleUpdate('category', e.target.value);
                }}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="ROYALTY_PAYMENTS">Royalty &amp; Payouts</option>
                <option value="ISBN_METADATA">ISBN &amp; Metadata</option>
                <option value="PRINTING_QUALITY">Printing Quality</option>
                <option value="DISTRIBUTION_AVAILABILITY">Distribution &amp; Stock</option>
                <option value="BOOK_STATUS_PRODUCTION">Production Status</option>
                <option value="GENERAL_INQUIRY">General Inquiry</option>
              </select>
            </div>

            {/* Priority Select with AI Suggested */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Priority
                </label>
                {ticket.aiPriority && (
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    AI: {ticket.aiPriority}
                  </span>
                )}
              </div>
              <select
                disabled={updatingTicket}
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleUpdate('priority', e.target.value);
                }}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Current Assignee */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono">Assignee:</span>
              <span className="font-medium text-foreground">
                {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
              </span>
            </div>
          </div>

          {/* AI-DRAFTED RESPONSE PANEL (The Hero Feature) */}
          <div className="bg-card rounded-xl border-t-2 border-t-primary border-x border-b border-border shadow-subtle p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>AI Response Assistant</span>
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  Drafted using KB &amp; live catalog data &middot; Editable
                </span>
              </div>

              <button
                onClick={() => handleGenerateDraft(true)}
                disabled={loadingDraft}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline transition disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${loadingDraft ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Error or degraded state */}
            {aiError && (
              <div className="p-3 bg-accent/10 border border-accent/25 rounded-lg text-accent-foreground text-xs flex items-start justify-between gap-2">
                <span>{aiError}</span>
                <button
                  onClick={() => handleGenerateDraft(true)}
                  className="font-bold underline shrink-0"
                >
                  Retry AI
                </button>
              </div>
            )}

            {/* AI Flags & Verification Checklist */}
            {draftFlags.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  Verification Flags:
                </span>
                <div className="space-y-1">
                  {draftFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-xs bg-accent/10 text-accent-foreground border border-accent/20 px-2.5 py-1 rounded-md"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Response Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Draft Response
                </label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {draftText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              {loadingDraft ? (
                <div className="h-44 bg-background border border-border rounded-lg p-4 flex flex-col justify-center items-center gap-2 text-xs">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <ShinyText text="Synthesizing policy and book facts into draft..." />
                </div>
              ) : (
                <textarea
                  rows={8}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Draft response will appear here..."
                  className="w-full bg-background border border-input rounded-lg p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition leading-relaxed resize-y font-sans"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setDraftText('')}
                className="text-xs text-muted-foreground hover:text-foreground transition font-mono"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={handleSendReply}
                disabled={sendingReply || !draftText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg text-xs font-semibold uppercase tracking-wider shadow-subtle transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </div>
          </div>

          {/* INTERNAL NOTES PANEL (Staff-Only) */}
          <div className="bg-card rounded-xl border border-border shadow-subtle p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-foreground font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-accent" />
                <span>Internal Staff Notes</span>
              </h3>
              <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                Staff Only
              </span>
            </div>

            {/* Note input form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                placeholder="Add private staff observation (never visible to author)..."
                className="w-full bg-background border border-input rounded-lg p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 transition resize-y font-sans"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !internalNoteText.trim()}
                  className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {addingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Existing Notes list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ticket.internalNotes?.length === 0 ? (
                <span className="text-xs text-muted-foreground italic block">
                  No internal notes recorded yet.
                </span>
              ) : (
                ticket.internalNotes?.map((note: any) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <strong className="text-foreground">{note.admin?.name || 'Staff'}</strong>
                      <span>{formatRelativeAge(note.createdAt)}</span>
                    </div>
                    <p className="text-foreground whitespace-pre-line leading-relaxed font-sans">
                      {note.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
