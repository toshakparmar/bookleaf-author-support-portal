'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { fetchApi } from '../../../../lib/api';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { ClickSpark } from '../../../../components/reactbits/ClickSpark';
import {
  ArrowLeft,
  Send,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Clock,
  HelpCircle,
  Camera,
  Coins,
  Barcode,
} from 'lucide-react';

function NewTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBookId = searchParams.get('bookId') || '';

  const [books, setBooks] = useState<any[]>([]);
  const [bookId, setBookId] = useState(preselectedBookId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchApi('/authors/me/books')
      .then((data) => {
        setBooks(data.books || []);
        if (preselectedBookId) {
          setBookId(preselectedBookId);
        }
      })
      .catch(() => {});
  }, [preselectedBookId]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setAttachmentError('');
    if (fileRejections && fileRejections.length > 0) {
      setAttachmentError('Files must be under 10MB in PDF, JPG, PNG, or DOC format.');
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      setAttachmentFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 20) {
      setErrorMessage('Please provide a description of at least 20 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      let attachmentMeta = null;
      if (attachmentFile) {
        attachmentMeta = {
          name: attachmentFile.name,
          sizeBytes: attachmentFile.size,
          mimeType: attachmentFile.type,
          uploadedAt: new Date().toISOString(),
          storageProvider: 's3_ready_mock',
        };
      }

      const res = await fetchApi('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          bookId: bookId || null,
          subject: subject.trim(),
          description: description.trim(),
          attachmentMeta,
        }),
      });

      setCreatedTicket(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit query. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdTicket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="bg-card border border-border rounded-xl p-8 shadow-subtle">
          <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="font-display text-2xl font-medium text-foreground tracking-tight">
            Query Received &amp; Logged
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
            Your query has been queued for editorial review and AI triage. Reference identifier:
          </p>

          <div className="my-5 inline-block font-mono text-xl font-semibold text-primary bg-primary/10 px-5 py-2 rounded-lg border border-primary/20 tracking-wider">
            {createdTicket.ticketNumber}
          </div>

          <p className="text-[11px] text-muted-foreground font-sans max-w-sm mx-auto mb-8">
            An operations specialist has been alerted. Our team responds within 48 hours.
          </p>

          <div className="flex items-center justify-center gap-3">
            <ClickSpark sparkColor="#1F5F4A">
              <Link
                href={`/author/tickets/${createdTicket.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider transition"
              >
                <span>View Conversation</span>
              </Link>
            </ClickSpark>

            <Link
              href="/author/books"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-xs font-medium transition"
            >
              <span>Back to Books</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/author/tickets"
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl text-foreground font-medium tracking-tight">
            Submit a Support Query
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Direct dispatch to the BookLeaf Publishing editorial and operations desk.
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Query Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-subtle">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Book Scope Dropdown */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Associated Book
              </label>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              >
                <option value="">General / Account Level (No specific title)</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.bookCode} &middot; {b.status})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-muted-foreground mt-1.5 block">
                Selecting a book links your live sales numbers, ISBN record, and production status.
              </span>
            </div>

            {/* Subject with Char Counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Subject
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    subject.length > 140 ? 'text-destructive font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {subject.length} / 150
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={150}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Discrepancy in quarterly royalty calculation"
                className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            {/* Description with Char Counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Query Description
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    description.length < 20 ? 'text-accent' : 'text-muted-foreground'
                  }`}
                >
                  {description.length} / 5,000 (min 20)
                </span>
              </div>
              <textarea
                required
                rows={6}
                minLength={20}
                maxLength={5000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your query in detail. Include platform names, copy counts, dates, or specific questions..."
                className="w-full bg-background border border-input rounded-lg p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-y leading-relaxed font-sans"
              />
            </div>

            {/* Drag and Drop Attachment Zone */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Supporting Documentation (Optional)
              </label>

              {!attachmentFile ? (
                <div
                  {...getRootProps()}
                  className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:bg-muted/30'
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-70" />
                  <p className="text-xs text-foreground font-medium">
                    Drag and drop file here, or{' '}
                    <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    PDF, JPG, PNG, or DOC up to 10MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {attachmentFile.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      ({Math.round(attachmentFile.size / 1024)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachmentFile(null)}
                    aria-label="Remove attachment"
                    className="p-1 text-muted-foreground hover:text-destructive rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {attachmentError && (
                <span className="text-xs text-destructive mt-1.5 block">
                  {attachmentError}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Link
                href="/author/tickets"
                className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || description.length < 20}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-subtle transition disabled:opacity-50"
              >
                {submitting ? 'Submitting Query...' : 'Submit Support Query'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Sticky "Before you submit" Knowledge Base Panel */}
        <div className="space-y-5">
          <div className="sticky top-20 bg-card border border-border rounded-xl p-5 shadow-subtle space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <HelpCircle className="w-4 h-4 text-primary shrink-0" />
              <h3 className="font-display font-medium text-sm text-foreground">
                Before You Submit
              </h3>
            </div>

            <div className="space-y-3.5 text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <Coins className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">Royalty Discrepancies</strong>
                  <span>
                    Royalties are 80% of net profits calculated quarterly and paid within 45 days. Balances below ₹1,000 roll over.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Barcode className="w-4 h-4 text-[#3E6FA8] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">ISBN Inconsistencies</strong>
                  <span>
                    Treated with High priority and escalated directly to production within 48 hours.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Camera className="w-4 h-4 text-[#C8453A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">Print Quality Issues</strong>
                  <span>
                    Please attach photos of the cover or misprinted pages to expedite free replacement authorization.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-border">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">Support SLA Guarantee</strong>
                  <span>All author inquiries receive an initial response within 48 hours.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">
          Loading query form...
        </div>
      }
    >
      <NewTicketForm />
    </Suspense>
  );
}
