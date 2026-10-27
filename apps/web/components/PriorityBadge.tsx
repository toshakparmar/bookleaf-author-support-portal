import React from 'react';

export function PriorityBadge({
  priority,
  isAiSuggested = false,
  isOverridden = false,
}: {
  priority: string;
  isAiSuggested?: boolean;
  isOverridden?: boolean;
}) {
  const normalized = (priority || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotStyles = 'bg-slate-400';

  switch (normalized) {
    case 'CRITICAL':
      styles = 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-500/30';
      dotStyles = 'bg-rose-600 animate-pulse';
      break;
    case 'HIGH':
      styles = 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-500/20';
      dotStyles = 'bg-amber-500';
      break;
    case 'MEDIUM':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      dotStyles = 'bg-blue-500';
      break;
    case 'LOW':
      styles = 'bg-slate-100 text-slate-600 border-slate-200';
      dotStyles = 'bg-slate-400';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
      <span>{priority}</span>
      {isOverridden && (
        <span className="text-[10px] bg-amber-100 text-amber-900 px-1 rounded ml-1 font-mono uppercase tracking-wider" title="Overridden by Admin">
          Overridden
        </span>
      )}
      {isAiSuggested && (
        <span className="text-[10px] bg-indigo-100 text-indigo-900 px-1 rounded ml-1 font-mono">
          AI
        </span>
      )}
    </span>
  );
}
