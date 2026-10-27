import React from 'react';
import {
  Coins,
  Barcode,
  Printer,
  Globe2,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

interface CategoryTagProps {
  category: string;
  className?: string;
  showIcon?: boolean;
}

export function CategoryTag({
  category,
  className = '',
  showIcon = true,
}: CategoryTagProps) {
  const configs: Record<string, { label: string; icon: React.ElementType }> = {
    ROYALTY_PAYMENTS: { label: 'Royalty & Payouts', icon: Coins },
    ISBN_METADATA: { label: 'ISBN & Metadata', icon: Barcode },
    PRINTING_QUALITY: { label: 'Printing Quality', icon: Printer },
    DISTRIBUTION_AVAILABILITY: { label: 'Distribution & Stock', icon: Globe2 },
    BOOK_STATUS_PRODUCTION: { label: 'Production Status', icon: BookOpen },
    GENERAL_INQUIRY: { label: 'General Inquiry', icon: HelpCircle },
  };

  const config = configs[category] || {
    label: category.replace(/_/g, ' '),
    icon: HelpCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" strokeWidth={1.5} />}
      <span>{config.label}</span>
    </span>
  );
}
