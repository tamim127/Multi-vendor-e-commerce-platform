'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mobileBottomNavItems } from '@/config/navigation';
import type { MobileBottomNavItem } from '@/types/navigation';

const navIcons: Record<MobileBottomNavItem['icon'], React.ComponentType<{ className?: string }>> = {
  home: Home,
  categories: LayoutGrid,
  search: Search,
  wishlist: Heart,
  cart: ShoppingBag,
  account: Home,
};

export interface MobileBottomNavProps {
  items?: MobileBottomNavItem[];
  className?: string;
}

/**
 * Enterprise Mobile Bottom Navigation Bar.
 * Fixed to viewport bottom with iOS/Android safe-area inset support and active route indicators.
 */
export function MobileBottomNav({
  items = mobileBottomNavItems,
  className,
}: MobileBottomNavProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border-subtle shadow-lg',
        'pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 px-2',
        className
      )}
    >
      <div className="flex items-center justify-around w-full">
        {items.map((item) => {
          const Icon = navIcons[item.icon];
          const isActive = pathname === item.href;

          return (
            <a
              key={item.id}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-md transition-colors select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive ? 'text-primary font-bold' : 'text-fg-muted hover:text-fg-primary'
              )}
            >
              <div className="relative flex items-center justify-center size-6">
                <Icon
                  className={cn(
                    'size-5 transition-transform duration-150',
                    isActive && 'scale-110 stroke-[2.5]'
                  )}
                />

                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-1 ring-surface tabular-nums">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight leading-tight mt-1 font-medium">
                {item.label}
              </span>

              {isActive && (
                <span
                  className="absolute bottom-0 size-1 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
