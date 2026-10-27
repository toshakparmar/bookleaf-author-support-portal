import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', href, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-base gap-1.5',
    md: 'text-xl gap-2',
    lg: 'text-2xl gap-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const content = (
    <div className={`inline-flex items-center font-display font-medium text-foreground tracking-tight ${sizeClasses[size]} ${className}`}>
      {/* Handcrafted Leaf Glyph SVG */}
      <svg
        className={`${iconSizes[size]} text-primary shrink-0 transition-transform duration-300 group-hover:rotate-6`}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 3.5 3 6.5 6 6.5 2.5 0 6-3 9-12z" />
      </svg>
      <span>
        BookLeaf <span className="font-sans font-normal text-xs uppercase tracking-widest text-muted-foreground ml-1">Publishing</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
