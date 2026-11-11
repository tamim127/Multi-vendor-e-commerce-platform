/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN USER & RBAC SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { AdminRole, AdminPermission, AdminUser } from '../types/admin';

export const AdminRoleSchema: z.ZodType<AdminRole> = z.enum([
  'super_admin',
  'catalog_manager',
  'order_manager',
  'support_lead',
  'finance_manager',
  'compliance_officer',
]);

export const AdminPermissionSchema: z.ZodType<AdminPermission> = z.enum([
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
]);

export const AdminUserSchema: z.ZodType<AdminUser> = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: AdminRoleSchema,
  avatarUrl: z.string().optional(),
  permissions: z.array(AdminPermissionSchema),
  isActive: z.boolean(),
  lastLoginAt: z.string(),
  createdAt: z.string(),
});
