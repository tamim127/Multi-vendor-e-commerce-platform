'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { MegaNavBar } from '@/components/layout/header/mega-nav-bar';
import { LanguageSelector } from '@/components/layout/header/language-selector';
import { topUtilityLinks } from '@/config/navigation';
import { useSafeRouter, useSafeSearchParams } from '@/lib/navigation/safe-navigation';
import { useTheme } from '@/lib/theme/theme-context';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { useWishlist } from '@/features/wishlist';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';

export interface DesktopHeaderProps {
  className?: string;
}

/**
 * Enterprise Desktop Header — Aureon Luxury Theme.
 * Features 3-tier structure: Dark Top Utility Row, Brand & Search Row, and Mega-Menu Category Row.
 */
export function DesktopHeader({ className }: DesktopHeaderProps): React.JSX.Element {
  const router = useSafeRouter();
  const searchParams = useSafeSearchParams();
  const currentQuery = searchParams?.get('q') ?? '';
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { itemCount, subtotal, openDrawer } = useCart();
  const { customer } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();

  const handleSearchSubmit = (submittedQuery: string): void => {
    const q = submittedQuery.trim();
    const target = q ? `/products?q=${encodeURIComponent(q)}` : '/products';
    if (router) {
      router.push(target);
    } else if (typeof window !== 'undefined') {
      window.location.assign(target);
    }
  };

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
        'hidden lg:flex flex-col w-full bg-white dark:bg-[#0B0B0C] border-b border-slate-200 dark:border-[#1A1A1E] transition-colors',
        className
      )}
    >
      {/* 1. Top Utility Row */}
      <div className="border-b border-slate-200 dark:border-[#1E1E22] bg-slate-50 dark:bg-[#0B0B0C] py-2 text-xs text-slate-600 dark:text-[#9CA3AF] transition-colors">
        <Container size="standard" className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-medium text-slate-800 dark:text-white/90 flex items-center gap-1.5">
              <span className="text-amber-500 dark:text-amber-400 font-bold">⚡</span>
              Global Multi-Vendor Trade Platform
            </span>
            <div className="h-3 w-px bg-slate-200 dark:bg-[#26262B]" />
            <div className="flex items-center gap-4">
              {topUtilityLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="text-slate-600 hover:text-slate-900 dark:text-[#9CA3AF] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded-xs"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />

            <div className="h-3 w-px bg-slate-200 dark:bg-[#26262B]" />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Toggle color theme. Current theme is ${resolvedTheme}`}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-[#9CA3AF] dark:hover:text-white transition-colors cursor-pointer rounded-xs p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 font-medium"
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-amber-500" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </Container>
      </div>

      {/* 2. Main Brand & Search Row */}
      <div className="py-3.5 bg-white dark:bg-[#0B0B0C] transition-colors">
        <Container size="standard" className="flex items-center justify-between gap-8">
          {/* Aureon Brand Logo */}
          <Link
            href="/"
            aria-label="Marketplace Homepage"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md p-1 select-none shrink-0 group"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ▲
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                Aureon
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 dark:text-amber-400 leading-none mt-1">
                MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Prominent Marketplace Search */}
          <div className="flex-1 flex justify-center max-w-3xl">
            <SearchBar initialQuery={currentQuery} onSearchSubmit={handleSearchSubmit} />
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-3 shrink-0">
            <SellerAction />
            <div className="h-5 w-px bg-slate-200 dark:bg-[#26262B]" />
            <AccountAction userName={customer?.firstName} />
            <WishlistAction count={wishlistCount} />
            <CartAction
              itemCount={itemCount}
              subtotal={itemCount > 0 ? formatMoneyMinor(subtotal) : undefined}
              onClick={(e) => {
                e.preventDefault();
                openDrawer();
              }}
            />
          </div>
        </Container>
      </div>

      {/* 3. Category & Mega Menu Navigation Row */}
      <MegaNavBar />
    </div>
  );
}
