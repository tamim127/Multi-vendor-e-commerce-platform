/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — ACTIONS COMPONENT
 * ==============================================================================
 * Interactive affordances: wishlist toggle, quick action / view.
 * Ensures strict event propagation isolation so card navigation is not triggered.
 * Enforces >= 44px interactive tap targets for WCAG 2.2 AA compliance.
 */

'use client';

import * as React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ProductCardActionsProps } from './product-card.types';

export function ProductCardWishlistButton({
  product,
  isWishlisted = false,
  onWishlistToggle,
  className,
}: {
  product: ProductCardActionsProps['product'];
  isWishlisted?: boolean;
  onWishlistToggle?: (product: ProductCardActionsProps['product']) => void;
  className?: string;
}): React.JSX.Element {
  const { t } = useI18n();

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(product);
  };

  const label = isWishlisted ? t('productCard.removeFromWishlist') : t('productCard.addToWishlist');

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'group/wishlist flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100',
        'min-h-[44px] min-w-[44px] transition-all duration-200 cursor-pointer',
        'hover:bg-white hover:scale-110 active:scale-95 hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500',
        className
      )}
      aria-label={label}
      aria-pressed={isWishlisted}
    >
      <Heart
        className={cn(
          'size-4.5 transition-transform duration-200',
          isWishlisted ? 'fill-rose-500 text-rose-500' : 'fill-none group-hover/wishlist:scale-110'
        )}
      />
    </button>
  );
}

export function ProductCardQuickActionButton({
  product,
  quickActionLabel,
  onQuickAction,
  className,
}: {
  product: ProductCardActionsProps['product'];
  quickActionLabel?: string;
  onQuickAction?: (product: ProductCardActionsProps['product']) => void;
  className?: string;
}): React.JSX.Element {
  const { t } = useI18n();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAction?.(product);
  };

  const label = quickActionLabel || t('productCard.quickView');

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full py-2 px-3.5 text-xs font-bold transition-all duration-200 cursor-pointer',
        'bg-slate-100/90 text-slate-800 hover:bg-primary hover:text-white shadow-xs active:scale-95',
        'border border-slate-200/60 hover:border-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      aria-label={label}
    >
      <ShoppingBag className="size-3.5 shrink-0 transition-transform group-hover:scale-110" aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
