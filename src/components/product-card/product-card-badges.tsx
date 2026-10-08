/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — BADGES COMPONENT
 * ==============================================================================
 * Renders contextual promotional, status, and algorithmic badges.
 */

'use client';

import * as React from 'react';
import { Badge, type BadgeVariant } from '@/components/ui/badge/badge';
import type { ProductBadgeTone } from '@/domains/catalog/types/badge';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ProductCardBadgesProps } from './product-card.types';

const TONE_TO_BADGE_VARIANT: Record<ProductBadgeTone, BadgeVariant> = {
  accent: 'brand',
  warning: 'warning',
  success: 'success',
  destructive: 'destructive',
  default: 'neutral',
  neutral: 'neutral',
};

export function ProductCardBadges({
  product,
  isSponsored = false,
  isFlashSale = false,
  editorialBadgeText,
  className,
}: ProductCardBadgesProps): React.JSX.Element | null {
  const { locale, t } = useI18n();

  const badges = product.badges ?? [];

  if (!isSponsored && !isFlashSale && !editorialBadgeText && badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-1 items-start', className)}>
      {/* Sponsored indicator */}
      {isSponsored && (
        <Badge
          variant="neutral"
          size="sm"
          className="font-semibold text-2xs uppercase tracking-wider"
        >
          {t('productCard.sponsored')}
        </Badge>
      )}

      {/* Flash sale indicator */}
      {isFlashSale && (
        <Badge
          variant="destructive"
          size="sm"
          className="font-bold text-2xs uppercase tracking-wider animate-pulse"
        >
          {t('productCard.flashSale')}
        </Badge>
      )}

      {/* Editorial badge */}
      {editorialBadgeText && (
        <Badge variant="brand" size="sm" className="font-semibold text-2xs">
          {editorialBadgeText}
        </Badge>
      )}

      {/* Domain product badges (top priority badges) */}
      {badges.slice(0, 2).map((badge) => {
        const variant = TONE_TO_BADGE_VARIANT[badge.tone ?? 'default'] ?? 'neutral';
        const label = (locale && badge.label[locale]) || badge.label.en;
        return (
          <Badge key={badge.id} variant={variant} size="sm" className="text-2xs font-semibold">
            {label}
          </Badge>
        );
      })}
    </div>
  );
}
