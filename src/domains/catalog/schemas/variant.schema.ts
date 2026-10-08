/**
 * ==============================================================================
 * CATALOG DOMAIN — VARIANT SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  DimensionUnit,
  ProductDimensions,
  ProductVariant,
  ProductWeight,
  VariantOptionValue,
  WeightUnit,
} from '../types/variant';
import { LocalizedTextSchema, MoneySchema } from './common.schema';
import { ProductMediaSchema } from './media.schema';

export const VariantOptionValueSchema: z.ZodType<VariantOptionValue> = z.object({
  attributeKey: z.string().min(1),
  attributeLabel: LocalizedTextSchema,
  value: z.string().min(1),
  displayValue: LocalizedTextSchema,
  swatch: z.string().optional(),
});

export const DimensionUnitSchema: z.ZodType<DimensionUnit> = z.enum(['cm', 'in', 'mm']);
export const WeightUnitSchema: z.ZodType<WeightUnit> = z.enum(['g', 'kg', 'lb', 'oz']);

export const ProductDimensionsSchema: z.ZodType<ProductDimensions> = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  unit: DimensionUnitSchema,
});

export const ProductWeightSchema: z.ZodType<ProductWeight> = z.object({
  value: z.number().positive(),
  unit: WeightUnitSchema,
});

export const ProductVariantSchema: z.ZodType<ProductVariant> = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  sku: z.string().min(1),
  options: z.array(VariantOptionValueSchema),
  media: z.array(ProductMediaSchema),
  msrpReference: MoneySchema.optional(),
  barcode: z.string().optional(),
  weight: ProductWeightSchema.optional(),
  dimensions: ProductDimensionsSchema.optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});
