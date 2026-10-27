import React from 'react';

interface SlaBadgeProps {
  isBreached: boolean;
  remainingHours?: number;
  className?: string;
}

export function SlaBadge({
  isBreached,
  remainingHours,
  className = '',
}: SlaBadgeProps) {
  if (isBreached) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border border-destructive/40 bg-destructive/10 text-destructive ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
        <span>SLA Breached</span>
      </span>
    );
  }

  if (remainingHours !== undefined && remainingHours <= 4) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border border-[#D98E04]/30 bg-[#D98E04]/10 text-[#A66D03] dark:text-[#E8B84A] ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D98E04]" />
        <span>{remainingHours}h left</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground ${className}`}
    >
      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
      <span>{remainingHours !== undefined ? `${remainingHours}h SLA` : 'Within SLA'}</span>
    </span>
  );
}
