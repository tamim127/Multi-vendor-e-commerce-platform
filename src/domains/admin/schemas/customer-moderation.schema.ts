/**
 * ==============================================================================
 * ADMIN DOMAIN — CUSTOMER MODERATION SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { CustomerAccountStatus, CustomerAdminSummary } from '../types/customer-management';

export const CustomerAccountStatusSchema: z.ZodType<CustomerAccountStatus> = z.enum([
  'active',
  'suspended',
]);

export interface CustomerModerationInput {
  customerId: string;
  status: CustomerAccountStatus;
  note?: string;
}

export const CustomerModerationInputSchema: z.ZodType<CustomerModerationInput> = z.object({
  customerId: z.string().min(1),
  status: CustomerAccountStatusSchema,
  note: z.string().optional(),
});

export const CustomerAdminSummarySchema: z.ZodType<CustomerAdminSummary> = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  status: CustomerAccountStatusSchema,
  totalOrders: z.number().int().nonnegative(),
  totalSpentMinor: z.number().int().nonnegative(),
  joinedAt: z.string(),
  lastLoginAt: z.string().optional(),
  notes: z.array(z.string()).optional(),
  isDemo: z.boolean().optional(),
});
