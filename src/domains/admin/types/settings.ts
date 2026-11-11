/**
 * ==============================================================================
 * ADMIN DOMAIN — PLATFORM SETTINGS TYPES
 * ==============================================================================
 */

export interface MarketplaceCommissionConfig {
  defaultCommissionPercent: number;
  categoryOverrides: Record<string, number>;
}

export interface SellerOnboardingConfig {
  autoApproveDemo: boolean;
  requireTaxId: boolean;
  requireIdentityVerification: boolean;
  defaultHandlingDays: number;
}

export interface PlatformPolicyConfig {
  standardReturnWindowDays: number;
  maxReturnWindowDays: number;
  disputeResolutionDays: number;
}

export interface PlatformFeatureFlags {
  enableSellerSelfRegistration: boolean;
  enableMultiCurrency: boolean;
  enableCoupons: boolean;
  enableReviewModeration: boolean;
  maintenanceMode: boolean;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportedLocales: string[];
  defaultLocale: string;
  supportedCurrencies: string[];
  defaultCurrency: string;
  commission: MarketplaceCommissionConfig;
  onboarding: SellerOnboardingConfig;
  policies: PlatformPolicyConfig;
  featureFlags: PlatformFeatureFlags;
  updatedAt: string;
  updatedBy: string;
}
