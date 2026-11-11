/**
 * ==============================================================================
 * ADMIN DOMAIN — RBAC & AUTHORIZATION UTILITIES
 * ==============================================================================
 * Strict fail-closed permission evaluation algorithms.
 * Evaluates whether an administrative actor has access to a resource or capability.
 */

import type { AdminUser, AdminRole, AdminPermission } from '../types/admin';
import type { RoleDefinition } from '../types/rbac';
import { ALL_ADMIN_PERMISSIONS } from '../fixtures/admin-users.fixture';

export const ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Administrator',
    description: 'Full unconstrained platform administrative control and authority.',
    permissions: ALL_ADMIN_PERMISSIONS,
  },
  catalog_manager: {
    role: 'catalog_manager',
    label: 'Catalog & Merchandising Manager',
    description: 'Manages products, categories, reviews, and merchandising assets.',
    permissions: [
      'catalog:read',
      'catalog:write',
      'catalog:moderate',
      'reviews:read',
      'reviews:moderate',
      'analytics:read',
    ],
  },
  order_manager: {
    role: 'order_manager',
    label: 'Fulfillment & Order Lead',
    description:
      'Supervises marketplace orders, shipments, delivery SLAs, and package fulfillment.',
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
  },
  support_lead: {
    role: 'support_lead',
    label: 'Customer Support Lead',
    description: 'Handles customer inquiries, account suspension, disputes, and review reports.',
    permissions: [
      'customers:read',
      'customers:moderate',
      'orders:read',
      'reviews:read',
      'reviews:moderate',
      'refunds:read',
    ],
  },
  finance_manager: {
    role: 'finance_manager',
    label: 'Finance & Treasury Manager',
    description: 'Manages platform commissions, payouts, refunds, promotions, and revenue reports.',
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
  },
  compliance_officer: {
    role: 'compliance_officer',
    label: 'Compliance & Trust Officer',
    description: 'Reviews merchant KYC credentials, legal compliance, and system audit logs.',
    permissions: [
      'sellers:read',
      'sellers:moderate',
      'audit_logs:read',
      'settings:read',
      'customers:read',
    ],
  },
};

/**
 * Returns the declared permissions for a given role.
 */
export function getRolePermissions(role: AdminRole): AdminPermission[] {
  return ROLE_DEFINITIONS[role]?.permissions || [];
}

/**
 * Strict fail-closed single permission check.
 */
export function hasPermission(
  user: AdminUser | null | undefined,
  permission: AdminPermission
): boolean {
  if (!user || !user.isActive) {
    return false;
  }
  // Super admin possesses all permissions
  if (user.role === 'super_admin') {
    return true;
  }
  return user.permissions.includes(permission);
}

/**
 * Evaluates if user possesses at least one of the specified permissions.
 */
export function hasAnyPermission(
  user: AdminUser | null | undefined,
  permissions: AdminPermission[]
): boolean {
  if (!user || !user.isActive) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  return permissions.some((perm) => user.permissions.includes(perm));
}

/**
 * Evaluates if user possesses all specified permissions.
 */
export function hasAllPermissions(
  user: AdminUser | null | undefined,
  permissions: AdminPermission[]
): boolean {
  if (!user || !user.isActive) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  return permissions.every((perm) => user.permissions.includes(perm));
}
