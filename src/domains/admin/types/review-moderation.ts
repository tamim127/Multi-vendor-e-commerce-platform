/**
 * ==============================================================================
 * ADMIN DOMAIN — REVIEW & CONTENT MODERATION TYPES
 * ==============================================================================
 */

export type ReviewModerationStatus = 'published' | 'reported' | 'hidden';

export type ReviewModerationAction = 'approve' | 'hide' | 'restore';

export interface AdminProductReview {
  id: string;
  productId: string;
  productTitle: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewModerationStatus;
  flagReason?: string;
  reportedCount: number;
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
}
