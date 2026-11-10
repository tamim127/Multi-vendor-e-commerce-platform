/**
 * ==============================================================================
 * CUSTOMER DOMAIN — CUSTOMER SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  Customer,
  CustomerAccountStatus,
  CustomerPreferences,
  CustomerProfileUpdateInput,
} from '../types/customer';

export const CustomerAccountStatusSchema: z.ZodType<CustomerAccountStatus> = z.enum([
  'active',
  'suspended',
  'pending_verification',
]);

export const CustomerPreferencesSchema: z.ZodType<CustomerPreferences> = z.object({
  language: z.enum(['en', 'bn', 'ar', 'hi']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED', 'SAR', 'JPY']),
  newsletterSubscribed: z.boolean(),
  orderUpdatesEmail: z.boolean(),
  orderUpdatesSms: z.boolean(),
  twoFactorEnabled: z.boolean(),
});

export const CustomerSchema: z.ZodType<Customer> = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  status: CustomerAccountStatusSchema,
  emailVerified: z.boolean(),
  preferences: CustomerPreferencesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CustomerProfileUpdateSchema: z.ZodType<CustomerProfileUpdateInput> = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  phoneNumber: z.string().trim().max(25).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});
