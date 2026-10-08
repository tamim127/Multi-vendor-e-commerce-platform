/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — BRAND COMPONENT
 * ==============================================================================
 * Displays the product's associated brand name with standardized styling.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ProductCardBrandProps } from './product-card.types';

export function ProductCardBrand({ name, className }: ProductCardBrandProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'text-2xs font-semibold uppercase tracking-wider text-fg-muted truncate',
        className
      )}
    >
      {name}
    </div>
  );
}
