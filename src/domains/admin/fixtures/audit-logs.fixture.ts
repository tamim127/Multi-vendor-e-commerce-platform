/**
 * ==============================================================================
 * ADMIN DOMAIN — AUDIT LOGS FIXTURES
 * ==============================================================================
 * Append-only administrative compliance records.
 * Deterministic seed records representing previous system operations.
 */

import type { AdminAuditLogEntry } from '../types/audit-log';

export const DEMO_AUDIT_LOGS: AdminAuditLogEntry[] = [
  {
    id: 'aud-log-1001',
    timestamp: '2026-02-20T09:30:00Z',
    actor: {
      id: 'admin-super-001',
      name: 'Alex Rivera (Super Admin)',
      role: 'super_admin',
    },
    action: 'SELLER_APPLICATION_APPROVED',
    targetType: 'seller',
    targetId: 'seller-tech-direct',
    metadata: {
      storeName: 'TechDirect Express',
      tier: 'enterprise',
      notes: 'Verified state business license and tax identification.',
    },
    outcome: 'success',
  },
  {
    id: 'aud-log-1002',
    timestamp: '2026-02-19T14:15:00Z',
    actor: {
      id: 'admin-catalog-002',
      name: 'Devon Miles (Catalog Lead)',
      role: 'catalog_manager',
    },
    action: 'PRODUCT_STATUS_APPROVED',
    targetType: 'product',
    targetId: 'prod-laptop-zenith-14',
    metadata: {
      productTitle: 'Zenith Pro 14" OLED Laptop',
      reviewChecklist: ['media_verified', 'specs_valid', 'pricing_compliant'],
    },
    outcome: 'success',
  },
  {
    id: 'aud-log-1003',
    timestamp: '2026-02-18T16:45:00Z',
    actor: {
      id: 'admin-support-004',
      name: 'Jordan Chen (Customer Support)',
      role: 'support_lead',
    },
    action: 'REVIEW_MODERATED_HIDDEN',
    targetType: 'review',
    targetId: 'rev-mod-104',
    metadata: {
      reason: 'Violation of Community Guidelines (Abusive Language)',
      reportedCount: 7,
    },
    outcome: 'success',
  },
  {
    id: 'aud-log-1004',
    timestamp: '2026-02-17T11:20:00Z',
    actor: {
      id: 'admin-finance-005',
      name: 'Sophia Patel (Finance Director)',
      role: 'finance_manager',
    },
    action: 'REFUND_REQUEST_APPROVED',
    targetType: 'refund',
    targetId: 'ref-req-802',
    metadata: {
      orderId: 'ord-demo-1002',
      amountMinor: 24900,
      currency: 'USD',
      reason: 'damaged',
    },
    outcome: 'success',
  },
  {
    id: 'aud-log-1005',
    timestamp: '2026-02-16T10:00:00Z',
    actor: {
      id: 'admin-super-001',
      name: 'Alex Rivera (Super Admin)',
      role: 'super_admin',
    },
    action: 'PLATFORM_SETTINGS_UPDATED',
    targetType: 'settings',
    targetId: 'platform-settings-global',
    metadata: {
      changedFields: ['commission.defaultCommissionPercent', 'onboarding.autoApproveDemo'],
      newCommission: 12.5,
    },
    outcome: 'success',
  },
];
