/**
 * ==============================================================================
 * ADMIN DOMAIN — PLATFORM SETTINGS FIXTURE
 * ==============================================================================
 */

import type { PlatformSettings } from '../types/settings';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'Nexus Global Marketplace',
  supportEmail: 'support@nexus-marketplace.demo',
  supportedLocales: ['en', 'bn', 'ar', 'hi'],
  defaultLocale: 'en',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'BDT'],
  defaultCurrency: 'USD',
  commission: {
    defaultCommissionPercent: 12.5,
    categoryOverrides: {
      'cat-electronics': 8.0,
      'cat-fashion': 15.0,
      'cat-home-living': 10.0,
    },
  },
  onboarding: {
    autoApproveDemo: true,
    requireTaxId: true,
    requireIdentityVerification: true,
    defaultHandlingDays: 2,
  },
  policies: {
    standardReturnWindowDays: 30,
    maxReturnWindowDays: 60,
    disputeResolutionDays: 7,
  },
  featureFlags: {
    enableSellerSelfRegistration: true,
    enableMultiCurrency: true,
    enableCoupons: true,
    enableReviewModeration: true,
    maintenanceMode: false,
  },
  updatedAt: '2026-02-15T12:00:00Z',
  updatedBy: 'Alex Rivera (Super Admin)',
};
