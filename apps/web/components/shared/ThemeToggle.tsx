'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground ${className}`}
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle color theme"
      className={`w-8 h-8 rounded-full border border-border bg-card/60 hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-accent transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-foreground transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
