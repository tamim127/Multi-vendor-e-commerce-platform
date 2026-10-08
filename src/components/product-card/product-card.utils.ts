/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — UTILITY FUNCTIONS
 * ==============================================================================
 * Variant configuration resolvers, price calculations, and media resolvers.
 */

import type { Product } from '@/domains/catalog/types/product';
import { calculateDiscount, formatMoneyMinor } from '@/domains/catalog/utils/money';
import type {
  ProductCardAspectRatio,
  ProductCardConfig,
  ProductCardVariant,
} from './product-card.types';

export const VARIANT_DEFAULTS: Record<ProductCardVariant, ProductCardConfig> = {
  standard: {
    showBrand: true,
    showRating: true,
    showReviewCount: true,
    showCompareAtPrice: true,
    showDiscount: true,
    showOfferCount: true,
    showBadges: true,
    showWishlist: true,
    showQuickAction: false,
    showEditorialCopy: false,
    defaultAspectRatio: 'square',
  },
  compact: {
    showBrand: false,
    showRating: true,
    showReviewCount: false,
    showCompareAtPrice: false,
    showDiscount: false,
    showOfferCount: false,
    showBadges: false,
    showWishlist: false,
    showQuickAction: false,
    showEditorialCopy: false,
    defaultAspectRatio: 'square',
  },
  large: {
    showBrand: true,
    showRating: true,
    showReviewCount: true,
    showCompareAtPrice: true,
    showDiscount: true,
    showOfferCount: true,
    showBadges: true,
    showWishlist: true,
    showQuickAction: true,
    showEditorialCopy: true,
    defaultAspectRatio: 'portrait',
  },
  editorial: {
    showBrand: true,
    showRating: true,
    showReviewCount: false,
    showCompareAtPrice: true,
    showDiscount: true,
    showOfferCount: false,
    showBadges: true,
    showWishlist: true,
    showQuickAction: true,
    showEditorialCopy: true,
    defaultAspectRatio: 'portrait',
  },
  horizontal: {
    showBrand: true,
    showRating: true,
    showReviewCount: true,
    showCompareAtPrice: true,
    showDiscount: true,
    showOfferCount: true,
    showBadges: true,
    showWishlist: true,
    showQuickAction: true,
    showEditorialCopy: true,
    defaultAspectRatio: 'square',
  },
  search: {
    showBrand: true,
    showRating: true,
    showReviewCount: true,
    showCompareAtPrice: true,
    showDiscount: true,
    showOfferCount: true,
    showBadges: true,
    showWishlist: true,
    showQuickAction: false,
    showEditorialCopy: false,
    defaultAspectRatio: 'square',
  },
  recommendation: {
    showBrand: true,
    showRating: true,
    showReviewCount: false,
    showCompareAtPrice: true,
    showDiscount: false,
    showOfferCount: false,
    showBadges: false,
    showWishlist: true,
    showQuickAction: false,
    showEditorialCopy: false,
    defaultAspectRatio: 'square',
  },
  'flash-sale': {
    showBrand: true,
    showRating: true,
    showReviewCount: false,
    showCompareAtPrice: true,
    showDiscount: true,
    showOfferCount: false,
    showBadges: true,
    showWishlist: true,
    showQuickAction: true,
    showEditorialCopy: false,
    defaultAspectRatio: 'square',
  },
  sponsored: {
    showBrand: true,
    showRating: true,
    showReviewCount: true,
    showCompareAtPrice: true,
    showDiscount: true,
    showOfferCount: true,
    showBadges: true,
    showWishlist: true,
    showQuickAction: false,
    showEditorialCopy: false,
    defaultAspectRatio: 'square',
  },
  'recently-viewed': {
    showBrand: false,
    showRating: true,
    showReviewCount: false,
    showCompareAtPrice: false,
    showDiscount: false,
    showOfferCount: false,
    showBadges: false,
    showWishlist: false,
    showQuickAction: false,
    showEditorialCopy: false,
    defaultAspectRatio: 'square',
  },
};

export function getVariantConfig(variant: ProductCardVariant): ProductCardConfig {
  return VARIANT_DEFAULTS[variant] ?? VARIANT_DEFAULTS.standard;
}

export interface ResolvedPricing {
  lowestPriceFormatted: string;
  compareAtPriceFormatted?: string;
  discountPercent?: number;
  hasMultipleOffers: boolean;
  offerCount: number;
}

export function resolveProductPricing(product: Product, locale?: string): ResolvedPricing {
  const lowestPrice = product.offerSummary.lowestPrice;
  const lowestPriceFormatted = formatMoneyMinor(lowestPrice, { locale });

  let compareAtPriceFormatted: string | undefined;
  let discountPercent: number | undefined;

  // Inspect variants for reference MSRP comparison
  const defaultVariant = product.defaultVariantId
    ? product.variants.find((v) => v.id === product.defaultVariantId)
    : product.variants[0];

  const msrp =
    defaultVariant?.msrpReference ?? product.variants.find((v) => v.msrpReference)?.msrpReference;

  if (
    msrp &&
    msrp.currency === lowestPrice.currency &&
    msrp.amountMinor > lowestPrice.amountMinor
  ) {
    try {
      const discount = calculateDiscount(msrp, lowestPrice);
      if (discount.value > 0) {
        compareAtPriceFormatted = formatMoneyMinor(msrp, { locale });
        discountPercent = discount.value;
      }
    } catch {
      // Gracefully ignore mismatched currency calculations
    }
  }

  return {
    lowestPriceFormatted,
    compareAtPriceFormatted,
    discountPercent,
    hasMultipleOffers: product.offerSummary.hasMultipleOffers,
    offerCount: product.offerSummary.offerCount,
  };
}

export interface ResolvedMedia {
  primaryUrl?: string;
  secondaryUrl?: string;
  altText: string;
}

export function resolveProductMedia(product: Product, locale?: string): ResolvedMedia {
  const primaryMedia =
    product.media.find((m) => m.role === 'primary' && m.type === 'image') ??
    product.media.find((m) => m.type === 'image') ??
    product.media[0];

  const secondaryMedia = product.media.find(
    (m) => m.role === 'gallery' && m.type === 'image' && m.id !== primaryMedia?.id
  );

  const title = (locale && product.title[locale]) || product.title.en;
  const altText = (locale && primaryMedia?.alt?.[locale]) || primaryMedia?.alt?.en || title;

  return {
    primaryUrl: primaryMedia?.url,
    secondaryUrl: secondaryMedia?.url,
    altText,
  };
}

export const ASPECT_RATIO_STYLES: Record<ProductCardAspectRatio, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  wide: 'aspect-[16/9]',
};
