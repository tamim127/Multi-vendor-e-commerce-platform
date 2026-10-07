'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileDrawer } from '@/components/layout/header/mobile-drawer';
import { CartAction } from '@/components/layout/header/header-actions';
import { SearchBar } from '@/components/layout/header/search-bar';

export interface MobileHeaderProps {
  className?: string;
}

/**
 * Enterprise Mobile Header.
 * Independent mobile composition supporting drawer triggers, brand mark,
 * expandable search bar, and cart badge.
 */
export function MobileHeader({ className }: MobileHeaderProps): React.JSX.Element {
  const [isSearchExpanded, setIsSearchExpanded] = React.useState<boolean>(false);

  return (
    <div
      className={cn(
        'lg:hidden flex flex-col w-full bg-surface/95 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30 transition-all duration-200',
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
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1 select-none"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-base shadow-xs">
            M
          </div>
          <span className="font-extrabold text-base tracking-tight text-fg-primary leading-none">
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
            className="flex size-10 items-center justify-center rounded-md text-fg-primary hover:bg-surface-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isSearchExpanded ? <X className="size-5" /> : <Search className="size-5" />}
          </button>

          <CartAction compact itemCount={3} />
        </div>
      </div>

      {/* Expandable Mobile Search Row */}
      {isSearchExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border-subtle/50 animate-in fade-in-0 duration-150">
          <SearchBar compact autoFocus />
        </div>
      )}
    </div>
  );
}
