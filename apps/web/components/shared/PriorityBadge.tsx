import React from 'react';

interface PriorityBadgeProps {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  variant?: 'pill' | 'bar';
  className?: string;
}

export function PriorityBadge({
  priority,
  variant = 'pill',
  className = '',
}: PriorityBadgeProps) {
  const configs: Record<
    string,
    { label: string; color: string; border: string; bg: string; text: string }
  > = {
    CRITICAL: {
      label: 'Critical',
      color: '#C8453A',
      border: 'border-[#C8453A]/30',
      bg: 'bg-[#C8453A]/10 dark:bg-[#C8453A]/20',
      text: 'text-[#A02C22] dark:text-[#E8736A]',
    },
    HIGH: {
      label: 'High',
      color: '#D98E04',
      border: 'border-[#D98E04]/30',
      bg: 'bg-[#D98E04]/10 dark:bg-[#D98E04]/20',
      text: 'text-[#A66D03] dark:text-[#E8B84A]',
    },
    MEDIUM: {
      label: 'Medium',
      color: '#3E6FA8',
      border: 'border-[#3E6FA8]/30',
      bg: 'bg-[#3E6FA8]/10 dark:bg-[#3E6FA8]/20',
      text: 'text-[#2B5480] dark:text-[#7BAEE8]',
    },
    LOW: {
      label: 'Low',
      color: '#6B8F7A',
      border: 'border-[#6B8F7A]/30',
      bg: 'bg-[#6B8F7A]/10 dark:bg-[#6B8F7A]/20',
      text: 'text-[#486354] dark:text-[#94B8A3]',
    },
  };

  const config = configs[priority] || configs.LOW;

  if (variant === 'bar') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span
          className="w-1 h-4 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs font-medium text-foreground tracking-tight">
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <span>{config.label}</span>
    </span>
  );
}
