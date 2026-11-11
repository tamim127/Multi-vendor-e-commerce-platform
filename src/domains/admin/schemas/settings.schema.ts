/**
 * ==============================================================================
 * ADMIN DOMAIN — PLATFORM SETTINGS SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  MarketplaceCommissionConfig,
  SellerOnboardingConfig,
  PlatformPolicyConfig,
  PlatformFeatureFlags,
  PlatformSettings,
} from '../types/settings';

export const MarketplaceCommissionConfigSchema: z.ZodType<MarketplaceCommissionConfig> = z.object({
  defaultCommissionPercent: z.number().min(0).max(50),
  categoryOverrides: z.record(z.number().min(0).max(50)),
});

export const SellerOnboardingConfigSchema: z.ZodType<SellerOnboardingConfig> = z.object({
  autoApproveDemo: z.boolean(),
  requireTaxId: z.boolean(),
  requireIdentityVerification: z.boolean(),
  defaultHandlingDays: z.number().int().min(1).max(30),
});

export const PlatformPolicyConfigSchema: z.ZodType<PlatformPolicyConfig> = z.object({
  standardReturnWindowDays: z.number().int().min(1).max(90),
  maxReturnWindowDays: z.number().int().min(1).max(180),
  disputeResolutionDays: z.number().int().min(1).max(30),
});

export const PlatformFeatureFlagsSchema: z.ZodType<PlatformFeatureFlags> = z.object({
  enableSellerSelfRegistration: z.boolean(),
  enableMultiCurrency: z.boolean(),
  enableCoupons: z.boolean(),
  enableReviewModeration: z.boolean(),
  maintenanceMode: z.boolean(),
});

export const PlatformSettingsSchema: z.ZodType<PlatformSettings> = z.object({
  platformName: z.string().min(2),
  supportEmail: z.string().email(),
  supportedLocales: z.array(z.string().min(2)),
  defaultLocale: z.string().min(2),
  supportedCurrencies: z.array(z.string().length(3)),
  defaultCurrency: z.string().length(3),
  commission: MarketplaceCommissionConfigSchema,
  onboarding: SellerOnboardingConfigSchema,
  policies: PlatformPolicyConfigSchema,
  featureFlags: PlatformFeatureFlagsSchema,
  updatedAt: z.string(),
  updatedBy: z.string(),
});
