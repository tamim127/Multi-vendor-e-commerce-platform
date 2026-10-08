/**
 * ==============================================================================
 * CATALOG DOMAIN — INVENTORY STATE TYPES
 * ==============================================================================
 * Declarative inventory status abstractions.
 * Authoritative stock state is maintained by SellerOffers, while derived summaries
 * provide customer-facing availability signals.
 */

export type InventoryState =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'preorder'
  | 'backorder'
  | 'unavailable'
  | 'limited_availability';

export interface InventorySummary {
  /** Current stock lifecycle state */
  state: InventoryState;
  /** Quantity available for sale (optional for privacy/strategy) */
  quantityAvailable?: number;
  /** Threshold below which low_stock is triggered */
  lowStockThreshold?: number;
  /** Estimated handling / lead time in business days */
  leadTimeDays?: number;
  /** Estimated restock or release date (ISO 8601 string) */
  restockDate?: string;
  /** Whether backorders are accepted */
  allowsBackorder?: boolean;
}
