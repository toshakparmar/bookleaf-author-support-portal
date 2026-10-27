'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useTheme } from 'next-themes';
import {
  Search,
  Ticket,
  AlertTriangle,
  UserCheck,
  Cpu,
  Moon,
  Sun,
  Inbox,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-foreground/30 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="w-full font-sans"
          loop
        >
          <div className="flex items-center px-3.5 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search tickets, switch filters, or toggle theme..."
              className="w-full py-3 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground rounded border border-border">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2 text-xs">
            <Command.Empty className="py-6 text-center text-muted-foreground text-xs">
              No results found.
            </Command.Empty>

            <Command.Group heading="Ticket Filters" className="text-muted-foreground font-mono text-[10px] uppercase px-2 py-1">
              <Command.Item
                onSelect={() => {
                  router.push('/admin/tickets');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer hover:bg-muted text-foreground text-xs transition-colors"
              >
                <Inbox className="w-3.5 h-3.5 text-primary" />
                <span>All Queue Tickets</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push('/admin/tickets?assignee=MINE');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer hover:bg-muted text-foreground text-xs transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#3E6FA8]" />
                <span>Assigned to Me</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  router.push('/admin/tickets?slaBreached=true');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer hover:bg-muted text-foreground text-xs transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                <span>Breached SLA Urgent</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="System" className="text-muted-foreground font-mono text-[10px] uppercase px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  onOpenChange(false);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer hover:bg-muted text-foreground text-xs transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-foreground" />
                )}
                <span>Toggle Color Theme (Light / Dark)</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
      <div
        className="fixed inset-0 -z-10"
        onClick={() => onOpenChange(false)}
      />
    </div>
  );
}
