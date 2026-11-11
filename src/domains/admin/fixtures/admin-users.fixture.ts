/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN USERS & RBAC FIXTURES
 * ==============================================================================
 */

import type { AdminUser, AdminPermission } from '../types/admin';

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  'sellers:read',
  'sellers:write',
  'sellers:moderate',
  'customers:read',
  'customers:write',
  'customers:moderate',
  'catalog:read',
  'catalog:write',
  'catalog:moderate',
  'orders:read',
  'orders:write',
  'orders:override',
  'refunds:read',
  'refunds:write',
  'refunds:process',
  'promotions:read',
  'promotions:write',
  'reviews:read',
  'reviews:moderate',
  'settings:read',
  'settings:write',
  'audit_logs:read',
  'analytics:read',
];

export const DEMO_SUPER_ADMIN: AdminUser = {
  id: 'admin-super-001',
  email: 'superadmin@marketplace.demo',
  name: 'Alex Rivera (Super Admin)',
  role: 'super_admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  permissions: ALL_ADMIN_PERMISSIONS,
  isActive: true,
  lastLoginAt: '2026-02-20T10:15:00Z',
  createdAt: '2025-01-01T00:00:00Z',
};

export const DEMO_CATALOG_MANAGER: AdminUser = {
  id: 'admin-catalog-002',
  email: 'catalog@marketplace.demo',
  name: 'Devon Miles (Catalog Lead)',
  role: 'catalog_manager',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  permissions: [
    'catalog:read',
    'catalog:write',
    'catalog:moderate',
    'reviews:read',
    'reviews:moderate',
    'analytics:read',
  ],
  isActive: true,
  lastLoginAt: '2026-02-19T14:22:00Z',
  createdAt: '2025-02-15T00:00:00Z',
};

export const DEMO_ORDER_MANAGER: AdminUser = {
  id: 'admin-orders-003',
  email: 'orders@marketplace.demo',
  name: 'Elena Rostova (Fulfillment Lead)',
  role: 'order_manager',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  permissions: [
    'orders:read',
    'orders:write',
    'orders:override',
    'refunds:read',
    'refunds:write',
    'refunds:process',
    'customers:read',
    'analytics:read',
  ],
  isActive: true,
  lastLoginAt: '2026-02-20T08:45:00Z',
  createdAt: '2025-03-01T00:00:00Z',
};

export const DEMO_SUPPORT_LEAD: AdminUser = {
  id: 'admin-support-004',
  email: 'support@marketplace.demo',
  name: 'Jordan Chen (Customer Support)',
  role: 'support_lead',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  permissions: [
    'customers:read',
    'customers:moderate',
    'orders:read',
    'reviews:read',
    'reviews:moderate',
    'refunds:read',
  ],
  isActive: true,
  lastLoginAt: '2026-02-18T16:10:00Z',
  createdAt: '2025-04-10T00:00:00Z',
};

export const DEMO_FINANCE_MANAGER: AdminUser = {
  id: 'admin-finance-005',
  email: 'finance@marketplace.demo',
  name: 'Sophia Patel (Finance Director)',
  role: 'finance_manager',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  permissions: [
    'analytics:read',
    'refunds:read',
    'refunds:write',
    'refunds:process',
    'promotions:read',
    'promotions:write',
    'orders:read',
    'settings:read',
  ],
  isActive: true,
  lastLoginAt: '2026-02-19T11:00:00Z',
  createdAt: '2025-05-01T00:00:00Z',
};

export const DEMO_COMPLIANCE_OFFICER: AdminUser = {
  id: 'admin-compliance-006',
  email: 'compliance@marketplace.demo',
  name: 'Liam Becker (Compliance & Legal)',
  role: 'compliance_officer',
  avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  permissions: [
    'sellers:read',
    'sellers:moderate',
    'audit_logs:read',
    'settings:read',
    'customers:read',
  ],
  isActive: true,
  lastLoginAt: '2026-02-17T09:30:00Z',
  createdAt: '2025-06-01T00:00:00Z',
};

export const DEMO_ADMIN_USERS: AdminUser[] = [
  DEMO_SUPER_ADMIN,
  DEMO_CATALOG_MANAGER,
  DEMO_ORDER_MANAGER,
  DEMO_SUPPORT_LEAD,
  DEMO_FINANCE_MANAGER,
  DEMO_COMPLIANCE_OFFICER,
];
