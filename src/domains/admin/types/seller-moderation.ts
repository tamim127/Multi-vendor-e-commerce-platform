/**
 * ==============================================================================
 * ADMIN DOMAIN — SELLER MODERATION TYPES
 * ==============================================================================
 */

import type { SellerStatus } from '@/domains/seller/types/seller';

export type { SellerStatus };

export type SellerModerationAction = 'approve' | 'reject' | 'suspend' | 'reactivate';

export interface SellerModerationRecord {
  sellerId: string;
  status: SellerStatus;
  notes?: string;
  reason?: string;
  moderatedBy: string;
  moderatedAt: string;
}

export interface ModerationHistoryEntry {
  id: string;
  targetId: string;
  targetType: 'seller' | 'product' | 'customer' | 'review';
  previousStatus: string;
  newStatus: string;
  action: string;
  reason?: string;
  actorName: string;
  timestamp: string;
}
