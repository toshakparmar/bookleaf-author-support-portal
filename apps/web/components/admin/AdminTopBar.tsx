'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../shared/ThemeToggle';
import { api } from '../../lib/api';
import { Search, LogOut, Radio } from 'lucide-react';

interface AdminTopBarProps {
  user?: { name: string; email: string };
  isLive: boolean;
  onOpenCommand: () => void;
  collapsed: boolean;
}

export function AdminTopBar({
  user,
  isLive,
  onOpenCommand,
  collapsed,
}: AdminTopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    router.push('/login');
  };

  return (
    <header
      className={`sticky top-0 z-20 h-14 border-b border-border bg-background/90 backdrop-blur-md transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        collapsed ? 'ml-16' : 'ml-60'
      }`}
    >
      {/* ⌘K trigger button */}
      <button
        onClick={onOpenCommand}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-card text-muted-foreground text-xs transition-colors w-64 sm:w-80 text-left"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 truncate">Quick jump or command...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground rounded border border-border">
          ⌘K
        </kbd>
      </button>

      {/* Right side live status, theme toggle, and profile */}
      <div className="flex items-center gap-3">
        {/* SSE / Polling indicator */}
        <div
          title={isLive ? 'Connected via Server-Sent Events' : 'Reconnecting — polling active'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
            isLive
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-[#D98E04]/10 border-[#D98E04]/20 text-[#D98E04]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLive ? 'bg-primary animate-pulse' : 'bg-[#D98E04]'
            }`}
          />
          <span>{isLive ? 'Live' : 'Polling'}</span>
        </div>

        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 text-accent-foreground flex items-center justify-center font-display text-xs font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-foreground leading-none">
                {user.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Ops Specialist
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-card transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
