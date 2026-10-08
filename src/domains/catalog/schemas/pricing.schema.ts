/**
 * ==============================================================================
 * CATALOG DOMAIN — PRICING SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { CurrencyMetadata, Discount, DiscountType, PriceRange } from '../types/pricing';
import { MoneySchema } from './common.schema';

export { MoneySchema };

export const DiscountTypeSchema: z.ZodType<DiscountType> = z.enum(['percentage', 'fixed']);

export const PriceRangeSchema: z.ZodType<PriceRange> = z
  .object({
    min: MoneySchema,
    max: MoneySchema,
  })
  .refine((data) => data.min.currency === data.max.currency, {
    message: 'Min and max price currencies must match',
  });

export const DiscountSchema: z.ZodType<Discount> = z.object({
  type: DiscountTypeSchema,
  value: z.number().nonnegative(),
  savings: MoneySchema,
});

export const CurrencyMetadataSchema: z.ZodType<CurrencyMetadata> = z.object({
  code: z.string().min(3),
  symbol: z.string().min(1),
  minorUnitDigits: z.number().int().nonnegative(),
  symbolPosition: z.enum(['prefix', 'suffix']),
  spaceBetweenSymbol: z.boolean(),
});
