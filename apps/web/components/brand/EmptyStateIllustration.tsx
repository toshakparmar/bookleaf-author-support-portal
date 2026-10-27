import React from 'react';

interface EmptyStateIllustrationProps {
  className?: string;
  type?: 'book' | 'inbox' | 'search';
}

export function EmptyStateIllustration({
  className = 'w-24 h-24',
  type = 'book',
}: EmptyStateIllustrationProps) {
  if (type === 'inbox') {
    return (
      <svg
        className={`${className} text-muted-foreground/40`}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="16" y="24" width="64" height="48" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M16 56h18c3 0 5 4 8 4h12c3 0 5-4 8-4h18" stroke="currentColor" strokeWidth="2" />
        <circle cx="48" cy="40" r="10" stroke="hsl(var(--primary))" strokeWidth="2" />
        <path d="M48 35v10M43 40h10" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Open book with leaf sprout
  return (
    <svg
      className={`${className} text-primary/80`}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Book base */}
      <path
        d="M48 30C40 24 24 24 16 26v48c8-2 24-2 32 4 8-6 24-6 32-4V26c-8-2-24-2-32 4z"
        fill="hsl(var(--card))"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Book spine line */}
      <path d="M48 30v48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Left page lines */}
      <path d="M24 38h16M24 46h16M24 54h12" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Right page lines */}
      <path d="M56 38h16M56 46h16M56 54h12" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Sprouting leaf at center */}
      <path
        d="M48 28c-4-8 2-16 10-14 1 5-4 11-10 14z"
        fill="hsl(var(--accent))"
        opacity="0.85"
      />
    </svg>
  );
}
