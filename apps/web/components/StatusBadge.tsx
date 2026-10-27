import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  switch (normalized) {
    case 'OPEN':
      styles = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
      label = 'Open';
      break;
    case 'IN_PROGRESS':
      styles = 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20';
      label = 'In Progress';
      break;
    case 'RESOLVED':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
      label = 'Resolved';
      break;
    case 'CLOSED':
      styles = 'bg-slate-100 text-slate-600 border-slate-200';
      label = 'Closed';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
}
