'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Logo } from '../brand/Logo';
import {
  Inbox,
  UserCheck,
  UserX,
  AlertTriangle,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  openCount?: number;
  breachedCount?: number;
}

export function AdminSidebar({
  collapsed,
  onToggle,
  openCount = 0,
  breachedCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentAssignee = searchParams?.get('assignee');
  const isBreached = searchParams?.get('slaBreached') === 'true';

  const navItems = [
    {
      label: 'Ticket Queue',
      href: '/admin/tickets',
      icon: Inbox,
      badge: openCount > 0 ? openCount : undefined,
      active: pathname === '/admin/tickets' && !currentAssignee && !isBreached,
    },
    {
      label: 'Assigned to Me',
      href: '/admin/tickets?assignee=MINE',
      icon: UserCheck,
      active: currentAssignee === 'MINE',
    },
    {
      label: 'Unassigned',
      href: '/admin/tickets?assignee=UNASSIGNED',
      icon: UserX,
      active: currentAssignee === 'UNASSIGNED',
    },
    {
      label: 'Breached SLA',
      href: '/admin/tickets?slaBreached=true',
      icon: AlertTriangle,
      badge: breachedCount > 0 ? breachedCount : undefined,
      badgeVariant: 'destructive',
      active: isBreached,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-30 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-3.5">
        {!collapsed && <Logo href="/admin/tickets" size="sm" />}
        {collapsed && (
          <div className="mx-auto">
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 3.5 3 6.5 6 6.5 2.5 0 6-3 9-12z" />
            </svg>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 px-2 space-y-1">
        <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
          {!collapsed && <span>Triage &amp; Operations</span>}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium ${
                    item.badgeVariant === 'destructive'
                      ? 'bg-destructive/15 text-destructive border border-destructive/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer stats / settings stub */}
      <div className="p-3 border-t border-border space-y-1">
        {!collapsed && (
          <div className="px-2 py-1.5 rounded-md bg-muted/40 text-[11px] text-muted-foreground font-mono">
            <span>Ops Console v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
