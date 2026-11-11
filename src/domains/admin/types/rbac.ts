/**
 * ==============================================================================
 * ADMIN DOMAIN — RBAC TYPES
 * ==============================================================================
 */

import type { AdminPermission, AdminRole } from './admin';

export interface RoleDefinition {
  role: AdminRole;
  label: string;
  description: string;
  permissions: AdminPermission[];
}

export interface PermissionCheckResult {
  hasAccess: boolean;
  missingPermissions: AdminPermission[];
  evaluatedAt: string;
}
