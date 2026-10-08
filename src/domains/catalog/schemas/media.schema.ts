/**
 * ==============================================================================
 * CATALOG DOMAIN — MEDIA SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { MediaFocalPoint, MediaRole, MediaType, ProductMedia } from '../types/media';
import { LocalizedTextSchema } from './common.schema';

export const MediaTypeSchema: z.ZodType<MediaType> = z.enum([
  'image',
  'video',
  '360_view',
  '3d_model',
]);

export const MediaRoleSchema: z.ZodType<MediaRole> = z.enum([
  'primary',
  'gallery',
  'thumbnail',
  'swatch',
  'banner',
]);

export const MediaFocalPointSchema: z.ZodType<MediaFocalPoint> = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const ProductMediaSchema: z.ZodType<ProductMedia> = z.object({
  id: z.string().min(1),
  type: MediaTypeSchema,
  role: MediaRoleSchema,
  url: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  alt: LocalizedTextSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  order: z.number().int().nonnegative(),
  focalPoint: MediaFocalPointSchema.optional(),
  durationSeconds: z.number().positive().optional(),
  mimeType: z.string().optional(),
});
