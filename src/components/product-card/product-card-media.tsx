/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — MEDIA COMPONENT
 * ==============================================================================
 * Responsive media presentation with aspect-ratio control, hover secondary
 * image transition, missing-image fallback, and overlay slots for badges & actions.
 */

'use client';

import * as React from 'react';
import { PackageX } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ProductCardMediaProps } from './product-card.types';
import { ASPECT_RATIO_STYLES, resolveProductMedia } from './product-card.utils';

export function ProductCardMedia({
  product,
  aspectRatio = 'square',
  priority = false,
  isUnavailable = false,
  badgesSlot,
  actionsSlot,
  className,
}: ProductCardMediaProps): React.JSX.Element {
  const { locale, t } = useI18n();
  const [imageError, setImageError] = React.useState<boolean>(false);

  const { primaryUrl, secondaryUrl, altText } = resolveProductMedia(product, locale);
  const isOutOfStock = product.offerSummary.offerCount === 0;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-surface-subtle flex items-center justify-center p-3 select-none',
        ASPECT_RATIO_STYLES[aspectRatio],
        className
      )}
    >
      {/* Primary Imagery */}
      {primaryUrl && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={primaryUrl}
          alt={altText}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
          className={cn(
            'h-full w-full object-contain object-center transition-transform duration-300 motion-reduce:transition-none group-hover:scale-105',
            secondaryUrl && 'group-hover:opacity-0 transition-opacity'
          )}
        />
      ) : (
        /* Missing image fallback */
        <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-fg-muted">
          <PackageX className="size-8 stroke-[1.5]" aria-hidden="true" />
          <span className="text-2xs font-medium line-clamp-1">{altText}</span>
        </div>
      )}

      {/* Secondary Gallery Image Cross-Fade on Hover */}
      {secondaryUrl && !imageError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={secondaryUrl}
          alt={`${altText} alternate view`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain object-center p-3 opacity-0 transition-opacity duration-300 motion-reduce:transition-none group-hover:opacity-100 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Badges Slot (top-start) */}
      {badgesSlot && (
        <div className="absolute top-2 start-2 z-10 flex flex-col gap-1 pointer-events-none">
          {badgesSlot}
        </div>
      )}

      {/* Actions Slot (top-end e.g. wishlist toggle) */}
      {actionsSlot && (
        <div className="absolute top-2 end-2 z-10 flex flex-col gap-1">{actionsSlot}</div>
      )}

      {/* Out of Stock / Unavailable Dim Overlay */}
      {(isOutOfStock || isUnavailable) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-xs text-white">
          <span className="rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
            {isUnavailable ? t('productCard.unavailable') : t('productCard.outOfStock')}
          </span>
        </div>
      )}
    </div>
  );
}
