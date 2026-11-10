/**
 * ==============================================================================
 * SELLER DOMAIN — INVENTORY MANAGEMENT TYPES
 * ==============================================================================
 */

export type StockAlertLevel = 'normal' | 'low_stock' | 'out_of_stock';

export interface InventoryItem {
  sku: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  variantName?: string;
  thumbnailUrl?: string;
  quantityAvailable: number;
  quantityReserved: number;
  lowStockThreshold: number;
  alertLevel: StockAlertLevel;
  location?: string;
  updatedAt: string;
}

export interface InventoryAdjustmentInput {
  sku: string;
  newQuantity: number;
  reason?: 'restock' | 'damaged' | 'audit_adjustment' | 'manual_override';
  notes?: string;
}

