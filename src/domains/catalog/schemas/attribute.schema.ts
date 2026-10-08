/**
 * ==============================================================================
 * CATALOG DOMAIN — ATTRIBUTE SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { AttributeType, AttributeValue, ProductAttribute } from '../types/attribute';
import { LocalizedTextSchema } from './common.schema';

export const AttributeTypeSchema: z.ZodType<AttributeType> = z.enum([
  'text',
  'number',
  'boolean',
  'enum',
  'range',
  'measurement',
]);

export const AttributeValueSchema: z.ZodType<AttributeValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]);

export const ProductAttributeSchema: z.ZodType<ProductAttribute> = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  label: LocalizedTextSchema,
  type: AttributeTypeSchema,
  value: AttributeValueSchema,
  displayValue: LocalizedTextSchema.optional(),
  unit: z.string().optional(),
  group: z.string().min(1),
  isFilterable: z.boolean(),
  isSearchable: z.boolean(),
  isVisibleOnPdp: z.boolean(),
  order: z.number().int().optional(),
});
