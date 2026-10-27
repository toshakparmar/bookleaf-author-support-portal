import React from 'react';
import { EmptyStateIllustration } from '../brand/EmptyStateIllustration';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  type?: 'book' | 'inbox' | 'search';
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  type = 'book',
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-card/40 ${className}`}
    >
      <EmptyStateIllustration type={type} className="w-20 h-20 mb-4" />
      <h3 className="font-display text-lg sm:text-xl font-medium text-foreground mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
