/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — TITLE COMPONENT
 * ==============================================================================
 * Semantic product title heading with responsive typography and variant-appropriate
 * line clamping to ensure visual grid consistency.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ProductCardTitleProps } from './product-card.types';

export function ProductCardTitle({
  title,
  variant = 'standard',
  className,
}: ProductCardTitleProps): React.JSX.Element {
  const isCompact = variant === 'compact' || variant === 'recently-viewed';
  const isLarge = variant === 'large' || variant === 'editorial';

  return (
    <h3
      className={cn(
        'font-semibold text-fg-primary group-hover:text-primary transition-colors leading-snug',
        isCompact && 'line-clamp-1 text-xs sm:text-sm min-h-[1.25rem]',
        isLarge && 'line-clamp-2 sm:line-clamp-3 text-base sm:text-lg font-bold min-h-[2.75rem]',
        !isCompact && !isLarge && 'line-clamp-2 text-sm min-h-[2.5rem]',
        className
      )}
    >
      {title}
    </h3>
  );
}
