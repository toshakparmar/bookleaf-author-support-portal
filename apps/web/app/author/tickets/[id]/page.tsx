'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '../../../../lib/api';
import { formatDate, formatRelativeAge } from '../../../../lib/utils';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { CategoryTag } from '../../../../components/shared/CategoryTag';
import { BookCover } from '../../../../components/brand/BookCover';
import { LottieAnimation } from '../../../../components/shared/LottieAnimation';
import { useTicketStream, TicketStreamEvent } from '../../../../lib/useTicketStream';
import {
  ArrowLeft,
  Send,
  BookOpen,
  Clock,
  Paperclip,
  AlertCircle,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function AuthorTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = useCallback(() => {
    fetchApi(`/tickets/${ticketId}`)
      .then((data) => setTicket(data))
      .catch((err) => setError(err.message || 'Ticket not found'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useTicketStream(
    useCallback(
      (event: TicketStreamEvent) => {
        if (
          (event.type === 'ticket.message' || event.type === 'ticket.updated') &&
          (event.payload.ticketId === ticketId || event.payload.id === ticketId)
        ) {
          loadTicket();
        }
      },
      [ticketId, loadTicket]
    )
  );

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await fetchApi(`/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: replyText.trim() }),
      });
      setReplyText('');
      loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-64 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="p-8 bg-card border border-border rounded-xl shadow-subtle">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <h2 className="font-display text-xl font-medium text-foreground">
            Ticket Not Available
          </h2>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            {error || 'This query cannot be accessed or does not exist.'}
          </p>
          <Link
            href="/author/tickets"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg transition"
          >
            Return to Queries
          </Link>
        </div>
      </div>
    );
  }

  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Ticket Details */}
      <div className="flex items-start gap-4 pb-5 border-b border-border">
        <Link
          href="/author/tickets"
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card transition mt-1 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {ticket.book && (
          <div className="hidden sm:block shrink-0">
            <BookCover
              title={ticket.book.title}
              authorName="BookLeaf Author"
              genre={ticket.book.genre || 'General'}
              size="sm"
              className="shadow-sm"
            />
          </div>
        )}

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
              {ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status} />
            <CategoryTag category={ticket.category} />
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-medium text-foreground tracking-tight">
            {ticket.subject}
          </h1>

          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
            {ticket.book && (
              <span className="flex items-center gap-1 text-foreground font-sans">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{ticket.book.title}</span>
              </span>
            )}
            <span>&middot;</span>
            <span>Opened {formatDate(ticket.createdAt)}</span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span>Active {formatRelativeAge(ticket.lastActivityAt)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-5">
        {/* Day separator */}
        <div className="relative text-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-[11px] font-mono uppercase text-muted-foreground tracking-wider">
            Conversation Thread
          </span>
        </div>

        {/* Initial Query from Author */}
        <div className="flex justify-end">
          <div className="max-w-xl bg-card border border-border rounded-xl p-5 shadow-subtle space-y-2.5 text-left">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-b border-border/60 pb-2">
              <span className="font-sans font-medium text-foreground">You (Initial Query)</span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>

            <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line font-sans">
              {ticket.description}
            </div>

            {ticket.attachmentMeta && (
              <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
                <Paperclip className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground font-medium truncate max-w-[220px]">
                  {ticket.attachmentMeta.name}
                </span>
                {ticket.attachmentMeta.sizeBytes && (
                  <span className="text-muted-foreground font-mono text-[10px]">
                    ({Math.round(ticket.attachmentMeta.sizeBytes / 1024)} KB)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Replies */}
        {ticket.messages?.map((msg: any) => {
          const isFromSupport = msg.sender === 'ADMIN';

          if (isFromSupport) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-xl bg-[#1F5F4A]/5 dark:bg-[#1F5F4A]/10 border border-[#1F5F4A]/20 rounded-xl p-5 shadow-subtle space-y-2.5 text-left">
                  <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1F5F4A]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-[10px] font-semibold">
                        BL
                      </div>
                      <span className="font-sans font-semibold text-primary">
                        Team BookLeaf
                      </span>
                    </div>
                    <span className="text-muted-foreground">{formatDate(msg.createdAt)}</span>
                  </div>

                  <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line font-sans">
                    {msg.body}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-xl bg-card border border-border rounded-xl p-5 shadow-subtle space-y-2.5 text-left">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-b border-border/60 pb-2">
                  <span className="font-sans font-medium text-foreground">You</span>
                  <span>{formatDate(msg.createdAt)}</span>
                </div>

                <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line font-sans">
                  {msg.body}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Composer for Follow-up Replies */}
      <div className="sticky bottom-6 bg-card border border-border rounded-xl p-5 shadow-elevated">
        {isResolved && (
          <div className="mb-3.5 p-3 rounded-lg bg-accent/10 border border-accent/25 text-accent-foreground text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent shrink-0" />
            <span>
              This query is marked <strong>Resolved</strong>. Sending a follow-up reply will automatically reopen it for editorial review.
            </span>
          </div>
        )}

        <form onSubmit={handleSendReply} className="space-y-3">
          <textarea
            required
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your message to Team BookLeaf..."
            className="w-full bg-background border border-input rounded-lg p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-sans"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground">
              Instant delivery to support desk
            </span>
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-subtle transition disabled:opacity-50"
            >
              {submittingReply ? 'Sending...' : 'Send Message'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
