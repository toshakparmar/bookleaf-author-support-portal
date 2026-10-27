'use client';

import React from 'react';
import { CountUp } from '../reactbits/CountUp';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'default' | 'urgent' | 'highlight';
  formatter?: (val: number) => string;
}

export function AdminStatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  subtext,
  icon: Icon,
  variant = 'default',
  formatter,
}: AdminStatCardProps) {
  const isUrgent = variant === 'urgent';
  const isHighlight = variant === 'highlight';

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-200 overflow-hidden ${
        isUrgent
          ? 'bg-destructive/5 dark:bg-destructive/10 border-destructive/30 text-destructive'
          : isHighlight
          ? 'bg-primary/5 dark:bg-primary/10 border-primary/25 text-foreground'
          : 'bg-card border-border text-foreground hover:border-muted-foreground/30 shadow-subtle'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-mono uppercase tracking-wider ${
            isUrgent
              ? 'text-destructive font-semibold'
              : 'text-muted-foreground'
          }`}
        >
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            isUrgent
              ? 'bg-destructive/15 border-destructive/25 text-destructive'
              : isHighlight
              ? 'bg-primary/15 border-primary/20 text-primary'
              : 'bg-muted/60 border-border text-muted-foreground'
          }`}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-semibold tracking-tight">
          <CountUp
            to={value}
            prefix={prefix}
            suffix={suffix}
            formatter={formatter}
          />
        </span>
      </div>

      {subtext && (
        <p
          className={`text-[11px] mt-1 font-sans ${
            isUrgent
              ? 'text-destructive/80 font-medium'
              : 'text-muted-foreground'
          }`}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
