/**
 * ==============================================================================
 * CATALOG DOMAIN — INVENTORY SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { InventoryState, InventorySummary } from '../types/inventory';

export const InventoryStateSchema: z.ZodType<InventoryState> = z.enum([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'preorder',
  'backorder',
  'unavailable',
  'limited_availability',
]);

export const InventorySummarySchema: z.ZodType<InventorySummary> = z.object({
  state: InventoryStateSchema,
  quantityAvailable: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  leadTimeDays: z.number().int().nonnegative().optional(),
  restockDate: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .optional(),
  allowsBackorder: z.boolean().optional(),
});
