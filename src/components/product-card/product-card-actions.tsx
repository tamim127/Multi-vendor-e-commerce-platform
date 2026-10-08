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
import { Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
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
        'group/wishlist flex items-center justify-center rounded-full bg-surface/90 backdrop-blur-xs shadow-xs',
        'min-h-[44px] min-w-[44px] transition-all duration-200',
        'hover:bg-surface hover:scale-105 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isWishlisted ? 'text-destructive' : 'text-fg-muted hover:text-destructive',
        className
      )}
      aria-label={label}
      aria-pressed={isWishlisted}
    >
      <Heart
        className={cn(
          'size-5 transition-transform duration-200',
          isWishlisted ? 'fill-current' : 'fill-none group-hover/wishlist:scale-110'
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
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleClick}
      className={cn(
        'min-h-[44px] w-full gap-2 text-xs font-semibold shadow-xs transition-transform active:scale-98',
        className
      )}
      aria-label={label}
    >
      <Eye className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}
