/**
 * ==============================================================================
 * SELLER DOMAIN — SCHEMAS & CONTRACTS UNIT TESTS
 * ==============================================================================
 */

import { describe, it, expect } from 'vitest';
import { SellerApplicationSchema } from '@/domains/seller/schemas/application.schema';
import { StoreProfileUpdateSchema } from '@/domains/seller/schemas/store.schema';
import { SellerOfferUpsertSchema } from '@/domains/seller/schemas/offer.schema';
import {
  InventoryAdjustmentSchema,
  DispatchPackageSchema,
} from '@/domains/seller/schemas/inventory.schema';

describe('Seller Domain — Schemas & Validation', () => {
  describe('SellerApplicationSchema', () => {
    const validApplication = {
      storeName: 'Nordic Audio Labs',
      storeSlug: 'nordic-audio-labs',
      storeDescription:
        'Authorized dealer of premium Scandinavian acoustic equipment with global warranty.',
      businessCategory: 'Consumer Electronics & Audio',
      businessInfo: {
        legalBusinessName: 'Nordic Audio AB',
        registrationNumber: 'SE-55691234',
        taxIdentificationNumber: 'SE5569123401',
        businessType: 'corporation' as const,
        countryOfRegistration: 'SE',
        businessAddress: {
          street: 'Hamngatan 12',
          city: 'Stockholm',
          state: 'Stockholm',
          postalCode: '11147',
          country: 'SE',
        },
        contactPerson: {
          name: 'Astrid Lind',
          email: 'astrid@nordicaudio.demo',
          phone: '+46 8 123 4567',
          role: 'Managing Partner',
        },
      },
      agreedToTerms: true,
      agreedToFeeStructure: true,
    };

    it('accepts compliant merchant application inputs', () => {
      const result = SellerApplicationSchema.safeParse(validApplication);
      expect(result.success).toBe(true);
    });

    it('rejects invalid store slugs with uppercase letters or special characters', () => {
      const invalid = {
        ...validApplication,
        storeSlug: 'Nordic_Audio_Labs!',
      };
      const result = SellerApplicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('storeSlug');
      }
    });

    it('rejects unagreed marketplace terms', () => {
      const invalid = {
        ...validApplication,
        agreedToTerms: false,
      };
      const result = SellerApplicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid contact email formats', () => {
      const invalid = {
        ...validApplication,
        businessInfo: {
          ...validApplication.businessInfo,
          contactPerson: {
            ...validApplication.businessInfo.contactPerson,
            email: 'not-an-email',
          },
        },
      };
      const result = SellerApplicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('StoreProfileUpdateSchema', () => {
    const validProfile = {
      name: 'TechDirect Express',
      tagline: 'Leading distributor of certified hardware.',
      description: 'Authorized enterprise hardware distributor providing same-day fulfillment.',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
      bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
      supportEmail: 'support@techdirect.demo',
      supportPhone: '+1 512-555-0142',
      shippingPolicy: 'Dispatches within 1-2 business days with full tracking.',
      returnPolicy: '30-day return policy for unopened items.',
      warrantyPolicy: '1-year comprehensive manufacturer warranty included.',
      fulfillmentSettings: {
        defaultFulfillmentType: 'marketplace_fulfilled' as const,
        standardHandlingDays: 1,
        shipsInternationally: true,
        freeShippingThresholdMinor: 9900,
        returnWindowDays: 30,
        restockingFeePercent: 0,
      },
    };

    it('accepts compliant store profile updates', () => {
      const result = StoreProfileUpdateSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('rejects handling days outside valid bounds (1-14)', () => {
      const invalid = {
        ...validProfile,
        fulfillmentSettings: {
          ...validProfile.fulfillmentSettings,
          standardHandlingDays: 25,
        },
      };
      const result = StoreProfileUpdateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('SellerOfferUpsertSchema', () => {
    const validOffer = {
      productId: 'prod-laptop-01',
      variantId: 'var-space-black-1tb',
      price: { amountMinor: 249900, currency: 'USD' },
      compareAtPrice: { amountMinor: 279900, currency: 'USD' },
      condition: 'new' as const,
      fulfillmentType: 'marketplace_fulfilled' as const,
      quantityAvailable: 45,
      leadTimeDays: 1,
      shippingEstimate: {
        minDays: 2,
        maxDays: 4,
        isFreeShipping: true,
      },
      warranty: {
        durationMonths: 12,
        provider: 'manufacturer' as const,
      },
      returnPolicyDays: 30,
      isActive: true,
    };

    it('validates compliant commercial offers', () => {
      const result = SellerOfferUpsertSchema.safeParse(validOffer);
      expect(result.success).toBe(true);
    });

    it('rejects currency mismatches between offer price and compare-at price', () => {
      const mismatch = {
        ...validOffer,
        compareAtPrice: { amountMinor: 279900, currency: 'EUR' },
      };
      const result = SellerOfferUpsertSchema.safeParse(mismatch);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Compare-at currency must match');
      }
    });

    it('rejects non-integer minor unit prices', () => {
      const invalid = {
        ...validOffer,
        price: { amountMinor: 2499.5, currency: 'USD' },
      };
      const result = SellerOfferUpsertSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('InventoryAdjustmentSchema', () => {
    it('accepts valid stock adjustments', () => {
      const result = InventoryAdjustmentSchema.safeParse({
        sku: 'MBP16-M3MAX-1TB',
        newQuantity: 120,
        reason: 'restock',
        notes: 'PO-2026-991 receipt',
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative stock quantities', () => {
      const result = InventoryAdjustmentSchema.safeParse({
        sku: 'MBP16-M3MAX-1TB',
        newQuantity: -5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('DispatchPackageSchema', () => {
    it('accepts valid package dispatch credentials', () => {
      const result = DispatchPackageSchema.safeParse({
        packageId: 'PKG-DEMO-001',
        carrier: 'FedEx Express Ground',
        trackingNumber: '794829103810',
        notes: 'Dispatched from dock 14',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing carrier or tracking number', () => {
      const result = DispatchPackageSchema.safeParse({
        packageId: 'PKG-DEMO-001',
        carrier: '',
        trackingNumber: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
