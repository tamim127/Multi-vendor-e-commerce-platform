/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE (PDP) — FEATURE TYPE DEFINITIONS
 * ==============================================================================
 * Strict contracts for variant selection matrix, multi-vendor offer routing,
 * demonstration feedback, and typed purchase intent boundaries for Phase 3.
 */

import type { Money } from '@/domains/catalog/types/pricing';
import type { Product } from '@/domains/catalog/types/product';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import type { ProductVariant } from '@/domains/catalog/types/variant';

/**
 * 5-State Selection Resolution Status
 */
export type PdpSelectionState =
  | 'partial_selection'
  | 'nonexistent_combination'
  | 'inactive_variant'
  | 'variant_no_offers'
  | 'valid_with_offers';

/**
 * Phase 3 Checkout Integration Intent Payload (Non-Persistent Boundary)
 */
export interface PdpPurchaseIntentPayload {
  productId: string;
  variantId?: string;
  offerId: string;
  sellerId: string;
  quantity: number;
  price: Money;
  timestamp: string;
}

/**
 * Demonstration Customer Feedback Fixtures Contract
 */
export interface DemoReview {
  id: string;
  productId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  createdAt: string;
  isVerifiedBuyer: boolean;
  helpfulCount: number;
}

export interface DemoQaItem {
  id: string;
  productId: string;
  question: string;
  askedBy: string;
  askedAt: string;
  answer: string;
  answeredBy: string;
  isMerchantAnswer: boolean;
  answeredAt: string;
  helpfulCount: number;
}

/**
 * Aggregated Product Detail Repository Response
 */
export interface ProductDetailData {
  product: Product;
  offers: SellerOffer[];
  relatedProducts: Product[];
  reviews: DemoReview[];
  qaList: DemoQaItem[];
}

/**
 * Hook options and return contract for PDP Selection
 */
export interface UsePdpSelectionOptions {
  product: Product;
  offers: SellerOffer[];
  initialVariantId?: string;
}

export interface UsePdpSelectionResult {
  selectedOptions: Record<string, string>;
  selectedVariant: ProductVariant | null;
  selectedOffer: SellerOffer | null;
  selectionState: PdpSelectionState;
  eligibleOffers: SellerOffer[];
  quantity: number;
  maxQuantity: number;
  isQuantityBoundedByDemo: boolean;
  canPurchase: boolean;
  statusMessageKey: string | null;
  setOption: (key: string, value: string) => void;
  selectOffer: (offerId: string) => void;
  setQuantity: (qty: number) => void;
}
