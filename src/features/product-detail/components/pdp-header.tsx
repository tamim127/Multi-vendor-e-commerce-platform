/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — HEADER COMPONENT
 * ==============================================================================
 * Canonical product title, brand metadata, star ratings, review count anchor,
 * and current SKU identifier.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import type { Product } from '@/domains/catalog/types/product';
import type { ProductVariant } from '@/domains/catalog/types/variant';
import { Rating } from '@/components/ui/rating/rating';

export interface PdpHeaderProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
  onReviewsClick?: () => void;
}

export function PdpHeader({
  product,
  selectedVariant,
  onReviewsClick,
}: PdpHeaderProps): React.JSX.Element {
  const { t, locale } = useI18n();

  const title = product.title[locale as keyof typeof product.title] ?? product.title.en;
  const shortDescription = product.shortDescription
    ? (product.shortDescription[locale as keyof typeof product.shortDescription] ??
      product.shortDescription.en)
    : undefined;

  const sku = selectedVariant?.sku ?? product.id;

  return (
    <div className="flex flex-col gap-2.5 pb-2">
      {/* Brand & SKU info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <Link
          href={`/products?brand=${product.brand.slug}`}
          className="font-semibold text-primary hover:underline uppercase tracking-wider"
        >
          {product.brand.name}
        </Link>
        <span className="font-mono text-fg-subtle">
          {t('pdp.sku')}: {sku}
        </span>
      </div>

      {/* Main Canonical H1 Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary leading-tight">
        {title}
      </h1>

      {/* Star Rating & Review Anchor */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <Rating value={product.ratingSummary.average} showValue={false} size="sm" />
          <span className="font-bold text-fg-primary">
            {product.ratingSummary.average.toFixed(1)}
          </span>
        </div>

        <span className="text-fg-subtle">•</span>

        <button
          type="button"
          onClick={onReviewsClick}
          className="text-fg-muted hover:text-primary transition-colors hover:underline text-xs sm:text-sm cursor-pointer"
        >
          {t('pdp.ratingCount', { count: product.ratingSummary.count })}
        </button>
      </div>

      {/* Short Description */}
      {shortDescription && (
        <p className="mt-1 text-sm text-fg-muted leading-relaxed">{shortDescription}</p>
      )}
    </div>
  );
}
