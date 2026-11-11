/**
 * ==============================================================================
 * SELLER DOMAIN — CORE SELLER TYPES & PERMISSIONS
 * ==============================================================================
 * Authoritative contracts for marketplace seller identity, approval statuses,
 * business profiles, and role capabilities.
 */

import type { SellerBadge, SellerRating } from '@/domains/catalog/types/seller';

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type SellerTier = 'standard' | 'enterprise' | 'official_brand';

export interface SellerBusinessInfo {
  legalBusinessName: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  businessType: 'corporation' | 'llc' | 'sole_proprietorship' | 'partnership';
  countryOfRegistration: string;
  businessAddress: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface SellerFulfillmentSettings {
  defaultFulfillmentType: 'marketplace_fulfilled' | 'seller_fulfilled';
  standardHandlingDays: number;
  shipsInternationally: boolean;
  freeShippingThresholdMinor?: number; // Minor units
  returnWindowDays: number;
  restockingFeePercent: number;
}

export interface SellerProfile {
  id: string;
  slug: string;
  name: string;
  email: string;
  status: SellerStatus;
  tier: SellerTier;
  logoUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  description?: string;
  rating: SellerRating;
  badges: SellerBadge[];
  isVerified: boolean;
  businessInfo: SellerBusinessInfo;
  fulfillmentSettings: SellerFulfillmentSettings;
  joinedAt: string;
  updatedAt: string;
}
