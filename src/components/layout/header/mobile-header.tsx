'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileDrawer } from '@/components/layout/header/mobile-drawer';
import { CartAction } from '@/components/layout/header/header-actions';
import { SearchBar } from '@/components/layout/header/search-bar';
import { useSafeRouter, useSafeSearchParams } from '@/lib/navigation/safe-navigation';
import { useCart } from '@/features/cart';

export interface MobileHeaderProps {
  className?: string;
}

/**
 * Enterprise Mobile Header — Aureon Luxury Theme.
 * Independent mobile composition supporting drawer triggers, brand mark,
 * expandable search bar, and cart badge.
 */
export function MobileHeader({ className }: MobileHeaderProps): React.JSX.Element {
  const router = useSafeRouter();
  const searchParams = useSafeSearchParams();
  const currentQuery = searchParams?.get('q') ?? '';
  const [isSearchExpanded, setIsSearchExpanded] = React.useState<boolean>(false);
  const { itemCount, openDrawer } = useCart();

  const handleSearchSubmit = (submittedQuery: string): void => {
    setIsSearchExpanded(false);
    const q = submittedQuery.trim();
    const target = q ? `/products?q=${encodeURIComponent(q)}` : '/products';
    if (router) {
      router.push(target);
    } else if (typeof window !== 'undefined') {
      window.location.assign(target);
    }
  };

  return (
    <div
      className={cn(
        'lg:hidden flex flex-col w-full bg-[#0B0B0C] border-b border-[#1A1A1E] sticky top-0 z-30 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        {/* Left: Drawer Trigger */}
        <div className="flex items-center shrink-0">
          <MobileDrawer />
        </div>

        {/* Center: Brand Mark */}
        <Link
          href="/"
          aria-label="Marketplace Homepage"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md p-1 select-none"
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-base shadow-md shadow-amber-500/20">
            ▲
          </div>
          <span className="font-extrabold text-base tracking-tight text-white leading-none">
            MARKETPLACE
          </span>
        </Link>

        {/* Right: Search Toggle & Cart */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-expanded={isSearchExpanded}
            aria-label={isSearchExpanded ? 'Close mobile search' : 'Open mobile search'}
            className="flex size-10 items-center justify-center rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#18181B] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {isSearchExpanded ? <X className="size-5" /> : <Search className="size-5" />}
          </button>

          <CartAction
            compact
            itemCount={itemCount}
            onClick={(e) => {
              e.preventDefault();
              openDrawer();
            }}
          />
        </div>
      </div>

      {/* Expandable Mobile Search Row */}
      {isSearchExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-[#1E1E22] bg-[#0B0B0C] animate-in fade-in-0 duration-150">
          <SearchBar
            compact
            autoFocus
            initialQuery={currentQuery}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>
      )}
    </div>
  );
}
