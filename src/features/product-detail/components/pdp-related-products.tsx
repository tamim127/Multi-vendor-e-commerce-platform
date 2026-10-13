/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — RELATED PRODUCTS COMPONENT
 * ==============================================================================
 * Grid showcase displaying related category and brand items with ProductCard.
 */

'use client';

import * as React from 'react';
import type { Product } from '@/domains/catalog/types/product';
import { ProductCard } from '@/components/product-card';
import { useI18n } from '@/lib/i18n';

export interface PdpRelatedProductsProps {
  relatedProducts: Product[];
}

export function PdpRelatedProducts({
  relatedProducts,
}: PdpRelatedProductsProps): React.JSX.Element {
  const { t } = useI18n();

  if (relatedProducts.length === 0) {
    return <></>;
  }

  return (
    <div className="mt-12 pt-8 border-t border-border-default">
      <h3 className="text-xl font-bold text-fg-primary mb-6">{t('pdp.relatedProducts')}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="standard" />
        ))}
      </div>
    </div>
  );
}
