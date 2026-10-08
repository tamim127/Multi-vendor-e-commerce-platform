/**
 * ==============================================================================
 * CATALOG DOMAIN — CATEGORY TYPES
 * ==============================================================================
 * Scalable category model supporting unlimited hierarchical depth (>3 levels).
 * Avoids rigid 2-level assumptions; products can belong to categories at any level.
 */

import type { LocalizedText } from './localization';
import type { ProductMedia } from './media';

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText;
  /** Null for root departments/categories */
  parentId: string | null;
  /** Hierarchical depth: 0 for root, 1, 2, 3, 4, etc. */
  level: number;
  /** Canonical URL/breadcrumb path, e.g. "/electronics/computers/laptops/ultrabooks" */
  path: string;
  image?: ProductMedia;
  icon?: string;
  childCount: number;
  productCount: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryBreadcrumb {
  id: string;
  slug: string;
  name: LocalizedText;
  level: number;
  path: string;
}
