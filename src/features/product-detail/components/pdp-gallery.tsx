/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — GALLERY COMPONENT
 * ==============================================================================
 * High-performance, responsive media gallery with thumbnail carousel,
 * variant media synchronization, keyboard navigation, and zoom-ready view.
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { ProductMedia } from '@/domains/catalog/types/media';
import type { ProductVariant } from '@/domains/catalog/types/variant';
import type { ProductBadge } from '@/domains/catalog/types/badge';
import { Badge } from '@/components/ui/badge/badge';

export interface PdpGalleryProps {
  productMedia: ProductMedia[];
  selectedVariant?: ProductVariant | null;
  badges?: ProductBadge[];
  productTitle: string;
}

export function PdpGallery({
  productMedia,
  selectedVariant,
  badges = [],
  productTitle,
}: PdpGalleryProps): React.JSX.Element {
  const { locale, isRtl } = useI18n();

  // Combine media: if current variant has specific media, prioritize it
  const mediaList = React.useMemo<ProductMedia[]>(() => {
    if (selectedVariant?.media && selectedVariant.media.length > 0) {
      return selectedVariant.media;
    }
    return productMedia.length > 0 ? productMedia : [];
  }, [productMedia, selectedVariant]);

  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  // Reset active index when variant or media list changes
  React.useEffect(() => {
    setActiveIndex(0);
  }, [selectedVariant?.id, mediaList]);

  const activeMedia = mediaList[activeIndex] ?? mediaList[0];

  const handlePrevious = (): void => {
    if (mediaList.length <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = (): void => {
    if (mediaList.length <= 1) return;
    setActiveIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const activeAlt =
    activeMedia?.alt[locale as keyof typeof activeMedia.alt] ??
    activeMedia?.alt?.en ??
    productTitle;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Showcase Frame */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border-default bg-surface shadow-xs group">
        {/* Badges Overlay */}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
            {badges.map((b) => (
              <Badge key={b.id} variant="neutral" size="sm" className="shadow-xs backdrop-blur-xs">
                {b.label[locale as keyof typeof b.label] ?? b.label.en}
              </Badge>
            ))}
          </div>
        )}

        {/* Media Content */}
        {activeMedia ? (
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <Image
              src={activeMedia.url}
              alt={activeAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              priority
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-fg-subtle">
            <ImageIcon className="size-16 stroke-1 mb-2" />
            <span className="text-sm font-medium">No image available</span>
          </div>
        )}

        {/* Navigation Arrows for multi-media */}
        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              onClick={isRtl ? handleNext : handlePrevious}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full border border-border-default bg-surface/90 p-2 text-fg-primary shadow-sm backdrop-blur-xs opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={isRtl ? handlePrevious : handleNext}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full border border-border-default bg-surface/90 p-2 text-fg-primary shadow-sm backdrop-blur-xs opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {mediaList.length > 1 && (
        <div
          role="tablist"
          aria-label="Product media thumbnails"
          className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin"
        >
          {mediaList.map((media, idx) => {
            const isSelected = idx === activeIndex;
            const thumbAlt =
              media.alt[locale as keyof typeof media.alt] ??
              media.alt?.en ??
              `${productTitle} thumbnail ${idx + 1}`;

            return (
              <button
                key={media.id || idx}
                role="tab"
                aria-selected={isSelected}
                aria-label={`View image ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-lg border bg-surface transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                    : 'border-border-default opacity-70 hover:opacity-100 hover:border-border-strong'
                }`}
              >
                <Image
                  src={media.thumbnailUrl || media.url}
                  alt={thumbAlt}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
