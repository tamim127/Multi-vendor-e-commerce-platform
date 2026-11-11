/**
 * ==============================================================================
 * ADMIN DOMAIN — AUDIT LOG TYPES
 * ==============================================================================
 * Authoritative append-only log record contracts for administrative actions.
 */

import type { AdminRole } from './admin';

export type AuditTargetType =
  | 'seller'
  | 'customer'
  | 'product'
  | 'category'
  | 'order'
  | 'refund'
  | 'return'
  | 'coupon'
  | 'review'
  | 'settings';

export interface AuditActor {
  id: string;
  name: string;
  role: AdminRole;
}

export interface AdminAuditLogEntry {
  id: string;
  timestamp: string;
  actor: AuditActor;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  metadata?: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'denied';
}
