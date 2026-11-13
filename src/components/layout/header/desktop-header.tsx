'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Flame } from 'lucide-react';
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
  const pathname = usePathname();
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
        'hidden lg:flex flex-col w-full bg-[#0B0B0C] border-b border-[#1A1A1E]',
        className
      )}
    >
      {/* 1. Top Utility Row */}
      <div className="border-b border-[#1E1E22] bg-[#0B0B0C] py-2 text-xs text-[#9CA3AF]">
        <Container size="standard" className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-medium text-white/90 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">⚡</span>
              Global Multi-Vendor Trade Platform
            </span>
            <div className="h-3 w-px bg-[#26262B]" />
            <div className="flex items-center gap-4">
              {topUtilityLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="text-[#9CA3AF] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded-xs"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />

            <div className="h-3 w-px bg-[#26262B]" />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Toggle color theme. Current theme is ${resolvedTheme}`}
              className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer rounded-xs p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
            >
              {resolvedTheme === 'dark' ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-amber-400" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </Container>
      </div>

      {/* 2. Main Brand & Search Row */}
      <div className="py-3.5 bg-[#0B0B0C]">
        <Container size="standard" className="flex items-center justify-between gap-8">
          {/* Aureon Brand Logo */}
          <Link
            href="/"
            aria-label="Marketplace Homepage"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md p-1 select-none shrink-0 group"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ▲
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xl tracking-tight text-white leading-none">
                Aureon
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400 leading-none mt-1">
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
            <div className="h-5 w-px bg-[#26262B]" />
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
      <div className="border-t border-[#1A1A1E] bg-[#0B0B0C] py-2">
        <Container size="standard" className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mega Menu Trigger */}
            <MegaMenu />

            <div className="h-4 w-px bg-[#26262B]" />

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
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'text-[#9CA3AF] hover:text-white hover:bg-[#18181B]'
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="hidden xl:flex items-center text-xs text-[#9CA3AF] font-medium gap-1.5">
            <Flame className="size-3.5 text-amber-400" />
            <span>24/7 Verified Merchant Support</span>
          </div>
        </Container>
      </div>
    </div>
  );
}
