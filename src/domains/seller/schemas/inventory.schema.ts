/**
 * ==============================================================================
 * SELLER DOMAIN — INVENTORY & ORDER DISPATCH SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { InventoryAdjustmentInput } from '../types/inventory';
import type { DispatchPackageInput } from '../types/order';

export const InventoryAdjustmentSchema: z.ZodType<InventoryAdjustmentInput> = z.object({
  sku: z.string().trim().min(1, 'SKU is required'),
  newQuantity: z.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative'),
  reason: z.enum(['restock', 'damaged', 'audit_adjustment', 'manual_override']).optional(),
  notes: z.string().trim().max(300).optional(),
});

export const DispatchPackageSchema: z.ZodType<DispatchPackageInput> = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  carrier: z.string().trim().min(2, 'Shipping carrier is required').max(50),
  trackingNumber: z.string().trim().min(3, 'Tracking number is required').max(80),
  notes: z.string().trim().max(300).optional(),
});

