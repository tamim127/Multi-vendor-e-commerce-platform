/**
 * ==============================================================================
 * ADMIN DOMAIN — CATALOG & PRODUCT MODERATION TYPES
 * ==============================================================================
 */

export type ProductModerationStatus = 'approved' | 'pending_review' | 'rejected' | 'hidden';

export type ProductModerationAction = 'approve' | 'reject' | 'hide' | 'restore';

export interface ProductModerationRecord {
  productId: string;
  status: ProductModerationStatus;
  notes?: string;
  reason?: string;
  moderatedBy: string;
  moderatedAt: string;
}

export interface CategoryAdminInput {
  slug: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  parentId: string | null;
  isActive: boolean;
  isFeatured?: boolean;
}
