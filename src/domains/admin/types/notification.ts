/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN NOTIFICATIONS TYPES
 * ==============================================================================
 */

export type AdminNotificationType =
  | 'seller_application'
  | 'seller_status'
  | 'product_moderation'
  | 'refund_request'
  | 'reported_review'
  | 'system_alert';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetUrl?: string;
  severity: 'info' | 'warning' | 'critical';
}
