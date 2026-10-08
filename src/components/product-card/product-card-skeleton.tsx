/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — SKELETON LOADING STATE
 * ==============================================================================
 * Coordinated, layout-stable loading placeholder matching each variant
 * to eliminate Cumulative Layout Shift (CLS).
 */

import * as React from 'react';
import { Card } from '@/components/ui/card/card';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import { cn } from '@/lib/utils';
import type { ProductCardSkeletonProps } from './product-card.types';
import { ASPECT_RATIO_STYLES } from './product-card.utils';

export function ProductCardSkeleton({
  variant = 'standard',
  aspectRatio = 'square',
  className,
}: ProductCardSkeletonProps): React.JSX.Element {
  const isHorizontal = variant === 'horizontal';
  const isCompact = variant === 'compact' || variant === 'recently-viewed';
  const isLarge = variant === 'large' || variant === 'editorial';

  if (isHorizontal) {
    return (
      <Card
        className={cn(
          'flex flex-col sm:flex-row overflow-hidden border border-border-subtle bg-surface p-4 gap-4 animate-pulse',
          className
        )}
        aria-hidden="true"
        aria-busy="true"
      >
        <Skeleton className="w-full sm:w-48 aspect-square rounded-md shrink-0" />
        <div className="flex flex-1 flex-col justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-xs" />
            <Skeleton className="h-4.5 w-3/4 rounded-xs" />
            <Skeleton className="h-3.5 w-1/2 rounded-xs" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-5 w-24 rounded-xs" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'flex flex-col justify-between overflow-hidden border border-border-subtle bg-surface p-4 space-y-3 animate-pulse h-full',
        className
      )}
      aria-hidden="true"
      aria-busy="true"
    >
      {/* Media skeleton */}
      <Skeleton className={cn('w-full rounded-md', ASPECT_RATIO_STYLES[aspectRatio])} />

      {/* Content skeleton */}
      <div className="space-y-2 pt-1 flex-1">
        {!isCompact && <Skeleton className="h-3 w-1/4 rounded-xs" />}
        <Skeleton className="h-4 w-4/5 rounded-xs" />
        {isLarge && <Skeleton className="h-3.5 w-3/5 rounded-xs" />}
        <Skeleton className="h-3.5 w-1/3 rounded-xs" />
      </div>

      {/* Footer skeleton */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-xs" />
        <Skeleton className="h-3 w-12 rounded-xs" />
      </div>
    </Card>
  );
}
