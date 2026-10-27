'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminTopBar } from '../../components/admin/AdminTopBar';
import { CommandPalette } from '../../components/admin/CommandPalette';
import { useTicketStream, TicketStreamEvent } from '../../lib/useTicketStream';
import { fetchApi } from '../../lib/api';
import { toast } from 'sonner';

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchApi('/auth/me')
      .then((u) => {
        if (u.role !== 'ADMIN') {
          router.push('/author/books');
        } else {
          setUser(u);
        }
      })
      .catch(() => {
        router.push('/login');
      });

    fetchApi('/admin/stats')
      .then((s) => setStats(s))
      .catch(() => {});
  }, [router]);

  const handleStreamEvent = useCallback((event: TicketStreamEvent) => {
    if (event.type === 'ticket.created') {
      toast.info('New Ticket Received', {
        description: `#${event.payload.ticketNumber}: "${event.payload.subject}"`,
      });
    } else if (event.type === 'ticket.ai_ready') {
      toast.success('AI Triage Complete', {
        description: `Ticket ${event.payload.ticketNumber} classified as ${event.payload.category} (${event.payload.priority})`,
      });
    } else if (event.type === 'ticket.message' && event.payload.sender === 'AUTHOR') {
      toast.info('Author Reply Received', {
        description: `${event.payload.ticketNumber}: ${event.payload.body?.substring(0, 80)}...`,
      });
    }
  }, []);

  const { isConnected, isUsingPollingFallback } = useTicketStream(handleStreamEvent);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Collapsible Admin Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        openCount={stats?.queue?.open || 0}
        breachedCount={stats?.queue?.breachedSla || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          user={user}
          isLive={isConnected && !isUsingPollingFallback}
          onOpenCommand={() => setCommandOpen(true)}
          collapsed={sidebarCollapsed}
        />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-60'
          }`}
        >
          {children}
        </main>
      </div>

      {/* ⌘K Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-12 text-xs font-mono">Loading operations workspace...</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
