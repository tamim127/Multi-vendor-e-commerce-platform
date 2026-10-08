/**
 * ==============================================================================
 * CATALOG DOMAIN — COMMON SCHEMAS
 * ==============================================================================
 * Foundational Zod schemas for monetary values, localized text, and pagination.
 */

import { z } from 'zod';
import type { PaginationMeta } from '../types/api';
import type { CatalogLocale, LocalizedText } from '../types/localization';
import type { CurrencyCode, Money } from '../types/pricing';

export const CatalogLocaleSchema: z.ZodType<CatalogLocale> = z.enum(['en', 'bn', 'ar', 'hi']);

export const LocalizedTextSchema: z.ZodType<LocalizedText> = z
  .object({
    en: z.string().min(1, 'English text is required as canonical fallback'),
    bn: z.string().optional(),
    ar: z.string().optional(),
    hi: z.string().optional(),
  })
  .catchall(z.string().optional());

export const CurrencyCodeSchema: z.ZodType<CurrencyCode> = z.string().min(3).max(5);

/**
 * Canonical Money Schema.
 * Invariant: amountMinor MUST be an integer representing minor units.
 * Floating point numbers will be rejected.
 */
export const MoneySchema: z.ZodType<Money> = z.object({
  amountMinor: z.number().int('amountMinor must be a strict integer minor unit'),
  currency: CurrencyCodeSchema,
});

export const PaginationMetaSchema: z.ZodType<PaginationMeta> = z.object({
  page: z.number().int().positive().optional(),
  totalPages: z.number().int().nonnegative().optional(),
  totalCount: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().optional(),
  previousCursor: z.string().optional(),
});
