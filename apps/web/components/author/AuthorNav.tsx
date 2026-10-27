'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../brand/Logo';
import { ThemeToggle } from '../shared/ThemeToggle';
import { api } from '../../lib/api';
import { BookOpen, Ticket, PlusCircle, LogOut } from 'lucide-react';

interface AuthorNavProps {
  user?: { name: string; email: string };
}

export function AuthorNav({ user }: AuthorNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    router.push('/login');
  };

  const navLinks = [
    { href: '/author/books', label: 'Books', icon: BookOpen },
    { href: '/author/tickets', label: 'Tickets', icon: Ticket },
    { href: '/author/tickets/new', label: 'New Query', icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-8">
          <Logo href="/author/books" size="sm" />

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/author/tickets'
                  ? pathname === '/author/tickets' || (pathname.startsWith('/author/tickets/') && pathname !== '/author/tickets/new')
                  : pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-card text-foreground shadow-subtle border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-display text-xs font-medium">
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:inline text-xs font-medium text-foreground max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-card transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
