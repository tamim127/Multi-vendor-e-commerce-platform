/**
 * ==============================================================================
 * CATALOG DOMAIN — BRAND TYPES
 * ==============================================================================
 * Marketplace brand identity and metadata.
 */

import type { LocalizedText } from './localization';
import type { ProductMedia } from './media';

export type BrandStatus = 'active' | 'inactive' | 'featured';

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: ProductMedia;
  description?: LocalizedText;
  websiteUrl?: string;
  status: BrandStatus;
  isFeatured: boolean;
  productCount?: number;
}
