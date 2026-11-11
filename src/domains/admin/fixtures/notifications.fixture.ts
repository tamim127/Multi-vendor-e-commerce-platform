/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN NOTIFICATIONS FIXTURES
 * ==============================================================================
 */

import type { AdminNotification } from '../types/notification';

export const DEMO_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-admin-01',
    type: 'seller_application',
    title: 'New Merchant Application Submitted',
    message: 'Nordic Audio Labs submitted merchant credentials for approval.',
    timestamp: '2026-02-18T14:30:00Z',
    isRead: false,
    targetUrl: '/admin/sellers',
    severity: 'info',
  },
  {
    id: 'notif-admin-02',
    type: 'reported_review',
    title: 'High Report Volume on Customer Review',
    message: 'A review on "AeroSound Pro Wireless Earbuds" was flagged 4 times for spam.',
    timestamp: '2026-02-17T22:15:00Z',
    isRead: false,
    targetUrl: '/admin/reviews',
    severity: 'warning',
  },
  {
    id: 'notif-admin-03',
    type: 'refund_request',
    title: 'Customer Refund Requested',
    message: 'Sarah Jenkins requested a $129.00 refund on Order #ord-demo-1001 (defective item).',
    timestamp: '2026-02-18T10:30:00Z',
    isRead: false,
    targetUrl: '/admin/refunds',
    severity: 'warning',
  },
  {
    id: 'notif-admin-04',
    type: 'system_alert',
    title: 'Scheduled Platform Maintenance Window',
    message: 'Database index maintenance scheduled for Sunday at 02:00 UTC.',
    timestamp: '2026-02-16T08:00:00Z',
    isRead: true,
    targetUrl: '/admin/settings',
    severity: 'info',
  },
];
