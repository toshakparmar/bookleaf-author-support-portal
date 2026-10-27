'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthorNav } from '../../components/author/AuthorNav';
import { AuthorFooter } from '../../components/author/AuthorFooter';
import { useTicketStream, TicketStreamEvent } from '../../lib/useTicketStream';
import { fetchApi } from '../../lib/api';
import { toast } from 'sonner';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchApi('/auth/me')
      .then((u) => {
        if (u.role !== 'AUTHOR') {
          router.push('/admin/tickets');
        } else {
          setUser(u);
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleStreamEvent = useCallback((event: TicketStreamEvent) => {
    if (event.type === 'ticket.message') {
      const msg = event.payload;
      const isFromAdmin = msg.sender === 'ADMIN';

      if (isFromAdmin) {
        toast.info('New Reply from BookLeaf Support', {
          description: msg.body.length > 90 ? msg.body.substring(0, 90) + '...' : msg.body,
        });
      }
    } else if (event.type === 'ticket.updated') {
      const updated = event.payload;
      toast.success('Ticket Status Updated', {
        description: `Ticket #${updated.ticketNumber || ''} is now ${updated.status}`,
      });
    }
  }, []);

  useTicketStream(handleStreamEvent);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col paper-grain selection:bg-primary selection:text-primary-foreground">
      <AuthorNav user={user} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <AuthorFooter />
    </div>
  );
}
