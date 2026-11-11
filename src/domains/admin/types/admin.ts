/**
 * ==============================================================================
 * ADMIN DOMAIN — USER, ROLE & PERMISSION TYPES
 * ==============================================================================
 */

export type AdminRole =
  | 'super_admin'
  | 'catalog_manager'
  | 'order_manager'
  | 'support_lead'
  | 'finance_manager'
  | 'compliance_officer';

export type AdminPermission =
  | 'sellers:read'
  | 'sellers:write'
  | 'sellers:moderate'
  | 'customers:read'
  | 'customers:write'
  | 'customers:moderate'
  | 'catalog:read'
  | 'catalog:write'
  | 'catalog:moderate'
  | 'orders:read'
  | 'orders:write'
  | 'orders:override'
  | 'refunds:read'
  | 'refunds:write'
  | 'refunds:process'
  | 'promotions:read'
  | 'promotions:write'
  | 'reviews:read'
  | 'reviews:moderate'
  | 'settings:read'
  | 'settings:write'
  | 'audit_logs:read'
  | 'analytics:read';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string;
  permissions: AdminPermission[];
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface AdminSession {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isDemoSession: boolean;
}
