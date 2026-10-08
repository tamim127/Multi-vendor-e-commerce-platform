/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — RATING COMPONENT
 * ==============================================================================
 * Fractional rating stars and review counter presentation using the core Rating primitive.
 */

import * as React from 'react';
import { Rating } from '@/components/ui/rating/rating';
import { cn } from '@/lib/utils';
import type { ProductCardRatingProps } from './product-card.types';

export function ProductCardRating({
  average,
  count,
  showReviewCount = true,
  size = 'sm',
  className,
}: ProductCardRatingProps): React.JSX.Element | null {
  if (average <= 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Rating value={average} reviewCount={showReviewCount ? count : undefined} size={size} />
    </div>
  );
}
