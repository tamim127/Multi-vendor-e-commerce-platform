/**
 * ==============================================================================
 * ADMIN DOMAIN — ORDER OVERSIGHT TYPES
 * ==============================================================================
 */

import type { CustomerOrderStatus } from '@/domains/customer/types/order';

export interface AdminOrderFilter {
  search?: string;
  status?: CustomerOrderStatus | 'all';
  sellerId?: string;
  paymentStatus?: 'paid' | 'pending' | 'refunded' | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminOrderTimelineEvent {
  id: string;
  orderId: string;
  status: string;
  actor: string;
  timestamp: string;
  note: string;
}
