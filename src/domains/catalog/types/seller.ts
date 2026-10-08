/**
 * ==============================================================================
 * CATALOG DOMAIN — SELLER TYPES
 * ==============================================================================
 * Marketplace merchant identity and summary contracts for catalog offers.
 */

export type SellerBadge = 'top_rated' | 'authorized_dealer' | 'official_store' | 'fast_shipper';

export interface SellerRating {
  average: number;
  count: number;
  positiveFeedbackPercent: number;
}

export interface SellerSummary {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  rating: SellerRating;
  badges: SellerBadge[];
  isVerified: boolean;
}
