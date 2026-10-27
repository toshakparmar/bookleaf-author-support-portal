import React from 'react';

interface StatusBadgeProps {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const configs: Record<
    string,
    { label: string; dotClass: string; bgClass: string; textClass: string; borderClass: string }
  > = {
    OPEN: {
      label: 'Open',
      dotClass: 'bg-[#3E6FA8]',
      bgClass: 'bg-[#3E6FA8]/10 dark:bg-[#3E6FA8]/20',
      textClass: 'text-[#2B5480] dark:text-[#7BAEE8]',
      borderClass: 'border-[#3E6FA8]/30',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      dotClass: 'bg-[#D98E04]',
      bgClass: 'bg-[#D98E04]/10 dark:bg-[#D98E04]/20',
      textClass: 'text-[#A66D03] dark:text-[#E8B84A]',
      borderClass: 'border-[#D98E04]/30',
    },
    RESOLVED: {
      label: 'Resolved',
      dotClass: 'bg-[#1F8A5B]',
      bgClass: 'bg-[#1F8A5B]/10 dark:bg-[#1F8A5B]/20',
      textClass: 'text-[#166543] dark:text-[#5FBF99]',
      borderClass: 'border-[#1F8A5B]/30',
    },
    CLOSED: {
      label: 'Closed',
      dotClass: 'bg-[#7A766B]',
      bgClass: 'bg-[#7A766B]/10 dark:bg-[#7A766B]/20',
      textClass: 'text-[#5E5A51] dark:text-[#A8A499]',
      borderClass: 'border-[#7A766B]/30',
    },
  };

  const config = configs[status] || configs.OPEN;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
