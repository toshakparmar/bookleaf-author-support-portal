import React from 'react';

export function AuthorFooter() {
  return (
    <footer className="w-full border-t border-border mt-auto py-6 text-center text-xs text-muted-foreground font-sans">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          BookLeaf Publishing &middot; Author Portal &middot; Operations in India &amp; United States
        </p>
        <p className="font-mono text-[11px] text-primary/90">
          Support Promise: All editorial &amp; royalty queries answered within 48 hours.
        </p>
      </div>
    </footer>
  );
}
