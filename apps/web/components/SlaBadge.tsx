import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export function SlaBadge({
  isBreached,
  remainingHours,
  ageHours,
}: {
  isBreached?: boolean;
  remainingHours?: number;
  ageHours?: number;
}) {
  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        SLA Breached ({ageHours}h open)
      </span>
    );
  }

  if (remainingHours !== undefined && remainingHours < 12) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        {remainingHours}h remaining
      </span>
    );
  }

  return null;
}
