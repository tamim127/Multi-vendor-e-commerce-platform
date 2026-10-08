/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM — TYPE DEFINITIONS
 * ==============================================================================
 * Core types, variants, and prop contracts for the canonical Product Card system.
 */

import type * as React from 'react';
import type { Product } from '@/domains/catalog/types/product';

export type ProductCardVariant =
  | 'standard'
  | 'compact'
  | 'large'
  | 'editorial'
  | 'horizontal'
  | 'search'
  | 'recommendation'
  | 'flash-sale'
  | 'sponsored'
  | 'recently-viewed';

export type ProductCardAspectRatio = 'square' | 'portrait' | 'wide';

export interface ProductCardConfig {
  showBrand: boolean;
  showRating: boolean;
  showReviewCount: boolean;
  showCompareAtPrice: boolean;
  showDiscount: boolean;
  showOfferCount: boolean;
  showBadges: boolean;
  showWishlist: boolean;
  showQuickAction: boolean;
  showEditorialCopy: boolean;
  defaultAspectRatio: ProductCardAspectRatio;
}

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: Product;
  variant?: ProductCardVariant;
  priority?: boolean;
  isLoading?: boolean;
  isUnavailable?: boolean;
  isWishlisted?: boolean;
  isSponsored?: boolean;
  flashSaleProgressPercent?: number;
  editorialBadgeText?: string;
  quickActionLabel?: string;
  showBrand?: boolean;
  showRating?: boolean;
  showReviewCount?: boolean;
  showCompareAtPrice?: boolean;
  showDiscount?: boolean;
  showOfferCount?: boolean;
  showBadges?: boolean;
  showWishlist?: boolean;
  showQuickAction?: boolean;
  showEditorialCopy?: boolean;
  aspectRatio?: ProductCardAspectRatio;
  onWishlistToggle?: (product: Product) => void;
  onQuickAction?: (product: Product) => void;
  onNavigate?: (product: Product) => void;
}

export interface ProductCardMediaProps {
  product: Product;
  aspectRatio?: ProductCardAspectRatio;
  priority?: boolean;
  isUnavailable?: boolean;
  badgesSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  className?: string;
}

export interface ProductCardBadgesProps {
  product: Product;
  isSponsored?: boolean;
  isFlashSale?: boolean;
  editorialBadgeText?: string;
  className?: string;
}

export interface ProductCardBrandProps {
  name: string;
  className?: string;
}

export interface ProductCardTitleProps {
  title: string;
  variant?: ProductCardVariant;
  className?: string;
}

export interface ProductCardRatingProps {
  average: number;
  count?: number;
  showReviewCount?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export interface ProductCardPriceProps {
  lowestPriceFormatted: string;
  compareAtPriceFormatted?: string;
  discountPercent?: number;
  hasMultipleOffers?: boolean;
  offerCount?: number;
  showCompareAtPrice?: boolean;
  showDiscount?: boolean;
  showOfferCount?: boolean;
  isFlashSale?: boolean;
  flashSaleProgressPercent?: number;
  className?: string;
}

export interface ProductCardActionsProps {
  product: Product;
  isWishlisted?: boolean;
  showWishlist?: boolean;
  showQuickAction?: boolean;
  quickActionLabel?: string;
  onWishlistToggle?: (product: Product) => void;
  onQuickAction?: (product: Product) => void;
  className?: string;
}

export interface ProductCardSkeletonProps {
  variant?: ProductCardVariant;
  aspectRatio?: ProductCardAspectRatio;
  className?: string;
}
