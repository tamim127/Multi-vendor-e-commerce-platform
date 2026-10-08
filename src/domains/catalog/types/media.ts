/**
 * ==============================================================================
 * CATALOG DOMAIN — PRODUCT MEDIA TYPES
 * ==============================================================================
 * Comprehensive media representation supporting images, video, 360 spin, and 3D.
 */

import type { LocalizedText } from './localization';

export type MediaType = 'image' | 'video' | '360_view' | '3d_model';

export type MediaRole = 'primary' | 'gallery' | 'thumbnail' | 'swatch' | 'banner';

export interface MediaFocalPoint {
  x: number; // 0.0 - 1.0 (horizontal percentage)
  y: number; // 0.0 - 1.0 (vertical percentage)
}

export interface ProductMedia {
  id: string;
  type: MediaType;
  role: MediaRole;
  url: string;
  thumbnailUrl?: string;
  alt: LocalizedText;
  width: number;
  height: number;
  order: number;
  focalPoint?: MediaFocalPoint;
  durationSeconds?: number; // For video media
  mimeType?: string;
}
