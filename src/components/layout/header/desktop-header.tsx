'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container/container';
import { SearchBar } from '@/components/layout/header/search-bar';
import {
  AccountAction,
  WishlistAction,
  CartAction,
  SellerAction,
} from '@/components/layout/header/header-actions';
import { MegaMenu } from '@/components/layout/header/mega-menu';
import { LanguageSelector } from '@/components/layout/header/language-selector';
import { topUtilityLinks, primaryNavigationLinks } from '@/config/navigation';
import { useTheme } from '@/lib/theme/theme-context';

export interface DesktopHeaderProps {
  className?: string;
}

/**
 * Enterprise Desktop Header.
 * Features 3-tier structure: Top Utility Row, Brand & Search Row, and Mega-Menu Category Row.
 */
export function DesktopHeader({ className }: DesktopHeaderProps): React.JSX.Element {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = (): void => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <div
      className={cn(
        'hidden lg:flex flex-col w-full bg-surface border-b border-border-subtle',
        className
      )}
    >
      {/* 1. Top Utility Row */}
      <div className="border-b border-border-subtle/60 bg-surface-muted/50 py-1.5 text-xs text-fg-muted">
        <Container size="standard" className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-medium text-fg-secondary">
              Global Multi-Vendor Trade Platform
            </span>
            <div className="h-3 w-px bg-border-subtle" />
            <div className="flex items-center gap-4">
              {topUtilityLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />

            <div className="h-3 w-px bg-border-subtle" />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Toggle color theme. Current theme is ${resolvedTheme}`}
              className="flex items-center gap-1.5 text-fg-muted hover:text-fg-primary transition-colors cursor-pointer rounded-xs p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="size-3.5 text-warning" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-primary" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </Container>
      </div>

      {/* 2. Main Brand & Search Row */}
      <div className="py-3.5">
        <Container size="standard" className="flex items-center justify-between gap-8">
          {/* Brand Logo Placeholder */}
          <Link
            href="/"
            aria-label="Marketplace Homepage"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1 select-none shrink-0"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xl shadow-xs">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-fg-primary leading-none">
                MARKETPLACE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary leading-none mt-0.5">
                Global Network
              </span>
            </div>
          </Link>

          {/* Prominent Marketplace Search */}
          <div className="flex-1 flex justify-center max-w-3xl">
            <SearchBar />
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-3 shrink-0">
            <SellerAction />
            <div className="h-5 w-px bg-border-subtle" />
            <AccountAction />
            <WishlistAction count={2} />
            <CartAction itemCount={3} subtotal="$289.00" />
          </div>
        </Container>
      </div>

      {/* 3. Category & Mega Menu Navigation Row */}
      <div className="border-t border-border-subtle/80 bg-surface py-2">
        <Container size="standard" className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mega Menu Trigger */}
            <MegaMenu />

            <div className="h-4 w-px bg-border-subtle" />

            {/* Primary Category Links with route-aware states */}
            <nav aria-label="Primary navigation" className="flex items-center gap-2">
              {primaryNavigationLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-fg-secondary hover:text-primary hover:bg-surface-muted'
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-destructive/15 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-destructive">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="hidden xl:flex items-center text-xs text-fg-muted font-medium">
            <span>24/7 Verified Merchant Support</span>
          </div>
        </Container>
      </div>
    </div>
  );
}
