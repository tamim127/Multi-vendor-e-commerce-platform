/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — PLP PRODUCT ITEM ADAPTER
 * ==============================================================================
 * Thin PLP adapter delegating directly to the canonical reusable ProductCard system.
 * Retains backward-compatible component boundary without duplicate implementation.
 */

'use client';

import * as React from 'react';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/domains/catalog/types/product';

export interface PlpProductItemProps {
  product: Product;
}

export function PlpProductItem({ product }: PlpProductItemProps): React.JSX.Element {
  return <ProductCard product={product} variant="standard" />;
}
