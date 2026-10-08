/**
 * ==============================================================================
 * CATALOG DOMAIN — PRODUCT BADGE TYPES
 * ==============================================================================
 * Semantic product badges indicating promotional, popularity, or curated status.
 * Visual presentation is decoupled and governed by the design system.
 */

import type { LocalizedText } from './localization';

export type ProductBadgeType =
  | 'new'
  | 'best_seller'
  | 'trending'
  | 'sale'
  | 'limited_edition'
  | 'sponsored'
  | 'recommended'
  | 'editorial_pick'
  | 'deal_of_the_day';

export type ProductBadgeTone =
  'default' | 'accent' | 'warning' | 'success' | 'destructive' | 'neutral';

export interface ProductBadge {
  id: string;
  type: ProductBadgeType;
  label: LocalizedText;
  tone?: ProductBadgeTone;
  priority?: number; // Ordering precedence
}
