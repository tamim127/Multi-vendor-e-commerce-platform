/**
 * ==============================================================================
 * CATALOG DOMAIN — COLLECTION TYPES
 * ==============================================================================
 * Curated marketplace product collections (e.g. "Trending", "Flash Sale", "Editor's Picks").
 */

import type { LocalizedText } from './localization';
import type { ProductMedia } from './media';

export type CollectionStatus = 'active' | 'inactive' | 'scheduled';

export interface CatalogCollection {
  id: string;
  slug: string;
  title: LocalizedText;
  description?: LocalizedText;
  bannerMedia?: ProductMedia;
  productIds: string[];
  productCount: number;
  ordering: number;
  status: CollectionStatus;
  startDate?: string;
  endDate?: string;
}
