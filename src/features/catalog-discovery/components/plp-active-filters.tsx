/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — ACTIVE FILTERS BAR
 * ==============================================================================
 * Displays chips for currently active filters with quick removal and "Clear all".
 */

'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button/button';
import { MOCK_BRANDS, MOCK_CATEGORIES } from '@/domains/catalog/fixtures';
import type { CatalogQueryParams } from '@/domains/catalog/types/query';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { useI18n } from '@/lib/i18n';

export interface PlpActiveFiltersProps {
  params: CatalogQueryParams;
  onRemoveCategory: () => void;
  onRemoveBrand: (brandSlug: string) => void;
  onRemovePrice: () => void;
  onRemoveRating: () => void;
  onRemoveInStock: () => void;
  onClearAll: () => void;
}

export function PlpActiveFilters({
  params,
  onRemoveCategory,
  onRemoveBrand,
  onRemovePrice,
  onRemoveRating,
  onRemoveInStock,
  onClearAll,
}: PlpActiveFiltersProps): React.JSX.Element | null {
  const { locale, t } = useI18n();

  const brandMap = React.useMemo(() => new Map(MOCK_BRANDS.map((b) => [b.slug, b])), []);

  // Compute active filters
  const hasCategory = Boolean(params.categorySlug || params.categoryId);
  const activeBrands = params.brandSlugs ?? [];
  const hasPrice =
    typeof params.minPriceMinor === 'number' || typeof params.maxPriceMinor === 'number';
  const hasRating = typeof params.minRating === 'number' && params.minRating > 0;
  const hasInStock = Boolean(params.inventoryStates?.includes('in_stock'));

  const totalActive =
    (hasCategory ? 1 : 0) +
    activeBrands.length +
    (hasPrice ? 1 : 0) +
    (hasRating ? 1 : 0) +
    (hasInStock ? 1 : 0);

  if (totalActive === 0) {
    return null;
  }

  // Category name lookup
  const categoryName = hasCategory
    ? (MOCK_CATEGORIES.find((c) => c.slug === params.categorySlug || c.id === params.categoryId)
        ?.name[locale] ?? 'Category')
    : '';

  // Formatted price string
  let priceString = '';
  if (hasPrice) {
    const currency = params.currency ?? 'USD';
    const minStr =
      typeof params.minPriceMinor === 'number'
        ? formatMoneyMinor({ amountMinor: params.minPriceMinor, currency }, { locale })
        : '0';
    const maxStr =
      typeof params.maxPriceMinor === 'number'
        ? formatMoneyMinor({ amountMinor: params.maxPriceMinor, currency }, { locale })
        : null;
    priceString = maxStr ? `${minStr} – ${maxStr}` : `≥ ${minStr}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted mr-1">
        {t('plp.filters')}:
      </span>

      {/* Category Chip */}
      {hasCategory && (
        <Badge
          variant="neutral"
          size="sm"
          className="gap-1.5 py-1 px-2.5 text-xs bg-surface border-border-subtle"
        >
          <span>{categoryName}</span>
          <button
            type="button"
            onClick={onRemoveCategory}
            className="hover:text-destructive focus:outline-none cursor-pointer"
            aria-label={`Remove category filter: ${categoryName}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {/* Brand Chips */}
      {activeBrands.map((slug) => {
        const brand = brandMap.get(slug);
        const name = brand?.name ?? slug;
        return (
          <Badge
            key={slug}
            variant="neutral"
            size="sm"
            className="gap-1.5 py-1 px-2.5 text-xs bg-surface border-border-subtle"
          >
            <span>{name}</span>
            <button
              type="button"
              onClick={() => onRemoveBrand(slug)}
              className="hover:text-destructive focus:outline-none cursor-pointer"
              aria-label={`Remove brand filter: ${name}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        );
      })}

      {/* Price Chip */}
      {hasPrice && (
        <Badge
          variant="neutral"
          size="sm"
          className="gap-1.5 py-1 px-2.5 text-xs bg-surface border-border-subtle"
        >
          <span>{priceString}</span>
          <button
            type="button"
            onClick={onRemovePrice}
            className="hover:text-destructive focus:outline-none cursor-pointer"
            aria-label="Remove price filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {/* Rating Chip */}
      {hasRating && (
        <Badge
          variant="neutral"
          size="sm"
          className="gap-1.5 py-1 px-2.5 text-xs bg-surface border-border-subtle"
        >
          <span>{t('plp.starsAndAbove', { stars: params.minRating!.toString() })}</span>
          <button
            type="button"
            onClick={onRemoveRating}
            className="hover:text-destructive focus:outline-none cursor-pointer"
            aria-label="Remove rating filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {/* In Stock Chip */}
      {hasInStock && (
        <Badge
          variant="neutral"
          size="sm"
          className="gap-1.5 py-1 px-2.5 text-xs bg-surface border-border-subtle"
        >
          <span>{t('plp.inStockOnly')}</span>
          <button
            type="button"
            onClick={onRemoveInStock}
            className="hover:text-destructive focus:outline-none cursor-pointer"
            aria-label="Remove in-stock filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {/* Clear All Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-xs text-fg-muted hover:text-fg-primary h-7 px-2"
      >
        {t('plp.clearAll')}
      </Button>
    </div>
  );
}
