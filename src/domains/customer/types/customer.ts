/**
 * ==============================================================================
 * CUSTOMER DOMAIN — CORE CUSTOMER TYPES
 * ==============================================================================
 */

import type { CurrencyCode } from '@/domains/catalog/types/pricing';
import type { Locale } from '@/lib/i18n/types';

export type CustomerAccountStatus = 'active' | 'suspended' | 'pending_verification';

export interface CustomerPreferences {
  language: Locale;
  currency: CurrencyCode;
  newsletterSubscribed: boolean;
  orderUpdatesEmail: boolean;
  orderUpdatesSms: boolean;
  twoFactorEnabled: boolean;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status: CustomerAccountStatus;
  emailVerified: boolean;
  preferences: CustomerPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfileUpdateInput {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
}
