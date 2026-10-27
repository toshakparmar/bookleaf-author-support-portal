'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LifeBuoy, PlusCircle, LogOut, ShieldAlert, Activity, Wifi, Radio } from 'lucide-react';
import { fetchApi } from '../lib/api';

export function Navbar({
  user,
  isConnected = false,
  isPolling = false,
}: {
  user?: { name: string; email: string; role: 'AUTHOR' | 'ADMIN'; authorCode?: string } | null;
  isConnected?: boolean;
  isPolling?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    router.push('/login');
    router.refresh();
  };

  const isAuthor = user?.role === 'AUTHOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href={isAdmin ? '/admin/tickets' : '/author/books'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  BookLeaf <span className="text-emerald-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">Support</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-mono">
                  {isAdmin ? 'Ops & AI Triage Console' : 'Author Portal'}
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {isAuthor && (
                <>
                  <Link
                    href="/author/books"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      pathname.startsWith('/author/books')
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    My Books
                  </Link>
                  <Link
                    href="/author/tickets"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      pathname === '/author/tickets' || (pathname.startsWith('/author/tickets/') && pathname !== '/author/tickets/new')
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <LifeBuoy className="w-4 h-4" />
                    My Tickets
                  </Link>
                  <Link
                    href="/author/tickets/new"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      pathname === '/author/tickets/new'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-700/80 hover:bg-emerald-600 text-white shadow-sm'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Submit Query
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    href="/admin/tickets"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      pathname.startsWith('/admin/tickets')
                        ? 'bg-slate-800 text-emerald-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Ticket Queue
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Controls & Connection Status */}
          <div className="flex items-center gap-4">
            {/* Real-time Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded bg-slate-800/80 border border-slate-700">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Live (SSE)
                  </span>
                </>
              ) : isPolling ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400 flex items-center gap-1">
                    <Radio className="w-3 h-3" /> Polling (5s)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400">Offline</span>
                </>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {user.authorCode ? `${user.authorCode} • Author` : 'Ops Administrator'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
