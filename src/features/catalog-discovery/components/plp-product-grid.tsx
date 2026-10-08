/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP PRODUCT GRID
 * ==============================================================================
 * Responsive CSS grid container presenting PLP product items.
 */

'use client';

import * as React from 'react';
import type { Product } from '@/domains/catalog/types/product';
import { PlpProductItem } from './plp-product-item';

export interface PlpProductGridProps {
  products: Product[];
}

export function PlpProductGrid({ products }: PlpProductGridProps): React.JSX.Element {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
      role="region"
      aria-label="Products Grid"
    >
      {products.map((product) => (
        <PlpProductItem key={product.id} product={product} />
      ))}
    </div>
  );
}
