import React from 'react';

const CATEGORY_NAMES: Record<string, string> = {
  ROYALTY_PAYMENTS: 'Royalty & Payouts',
  ISBN_METADATA: 'ISBN & Metadata',
  PRINTING_QUALITY: 'Printing & Quality',
  DISTRIBUTION_AVAILABILITY: 'Distribution & Stock',
  BOOK_STATUS_PRODUCTION: 'Production Status',
  GENERAL_INQUIRY: 'General Inquiry',
};

const CATEGORY_STYLES: Record<string, string> = {
  ROYALTY_PAYMENTS: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ISBN_METADATA: 'bg-purple-50 text-purple-800 border-purple-200',
  PRINTING_QUALITY: 'bg-orange-50 text-orange-800 border-orange-200',
  DISTRIBUTION_AVAILABILITY: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  BOOK_STATUS_PRODUCTION: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  GENERAL_INQUIRY: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function CategoryBadge({
  category,
  isOverridden = false,
}: {
  category: string;
  isOverridden?: boolean;
}) {
  const label = CATEGORY_NAMES[category] || category || 'General';
  const style = CATEGORY_STYLES[category] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {label}
      {isOverridden && (
        <span className="text-[9px] bg-amber-100 text-amber-900 px-1 rounded ml-1 font-mono uppercase" title="Overridden by Admin">
          Overridden
        </span>
      )}
    </span>
  );
}
