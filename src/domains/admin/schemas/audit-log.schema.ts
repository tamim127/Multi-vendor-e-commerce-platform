/**
 * ==============================================================================
 * ADMIN DOMAIN — AUDIT LOG SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { AuditTargetType, AuditActor, AdminAuditLogEntry } from '../types/audit-log';
import { AdminRoleSchema } from './admin.schema';

export const AuditTargetTypeSchema: z.ZodType<AuditTargetType> = z.enum([
  'seller',
  'customer',
  'product',
  'category',
  'order',
  'refund',
  'return',
  'coupon',
  'review',
  'settings',
]);

export const AuditActorSchema: z.ZodType<AuditActor> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: AdminRoleSchema,
});

export const AdminAuditLogEntrySchema: z.ZodType<AdminAuditLogEntry> = z.object({
  id: z.string().min(1),
  timestamp: z.string(),
  actor: AuditActorSchema,
  action: z.string().min(1),
  targetType: AuditTargetTypeSchema,
  targetId: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  outcome: z.enum(['success', 'failure', 'denied']),
});
