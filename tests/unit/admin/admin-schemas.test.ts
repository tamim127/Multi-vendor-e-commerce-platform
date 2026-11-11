/**
 * ==============================================================================
 * ADMIN DOMAIN — SCHEMAS & CONTRACTS UNIT TESTS
 * ==============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  AdminRoleSchema,
  AdminPermissionSchema,
  AdminUserSchema,
  SellerModerationInputSchema,
  CustomerModerationInputSchema,
  ProductModerationInputSchema,
  CategoryAdminInputSchema,
  RefundRequestSchema,
  ReturnRequestSchema,
  CouponSchema,
  PromotionSchema,
  ReviewModerationInputSchema,
  PlatformSettingsSchema,
  AdminAuditLogEntrySchema,
} from '@/domains/admin';

describe('Admin Domain — Schemas & Validation', () => {
  describe('AdminRoleSchema & AdminPermissionSchema', () => {
    it('validates allowed admin roles', () => {
      expect(AdminRoleSchema.safeParse('super_admin').success).toBe(true);
      expect(AdminRoleSchema.safeParse('catalog_manager').success).toBe(true);
      expect(AdminRoleSchema.safeParse('compliance_officer').success).toBe(true);
      expect(AdminRoleSchema.safeParse('unknown_role').success).toBe(false);
    });

    it('validates allowed permissions', () => {
      expect(AdminPermissionSchema.safeParse('sellers:read').success).toBe(true);
      expect(AdminPermissionSchema.safeParse('catalog:moderate').success).toBe(true);
      expect(AdminPermissionSchema.safeParse('audit_logs:read').success).toBe(true);
      expect(AdminPermissionSchema.safeParse('invalid_permission').success).toBe(false);
    });

    it('validates structured AdminUser', () => {
      const validUser = {
        id: 'admin-001',
        email: 'admin@marketplace.demo',
        name: 'Super Admin',
        role: 'super_admin' as const,
        permissions: ['sellers:read' as const, 'sellers:moderate' as const],
        isActive: true,
        lastLoginAt: '2026-02-20T10:00:00Z',
        createdAt: '2025-01-01T00:00:00Z',
      };
      expect(AdminUserSchema.safeParse(validUser).success).toBe(true);

      const invalidUser = { ...validUser, email: 'not-an-email' };
      expect(AdminUserSchema.safeParse(invalidUser).success).toBe(false);
    });
  });

  describe('SellerModerationInputSchema', () => {
    it('accepts compliant seller moderation input', () => {
      const input = {
        sellerId: 'seller-tech-direct',
        status: 'approved' as const,
        reason: 'KYC verified',
        notes: 'Passed corporate registry check.',
      };
      expect(SellerModerationInputSchema.safeParse(input).success).toBe(true);
    });

    it('rejects empty seller ID or invalid status', () => {
      expect(
        SellerModerationInputSchema.safeParse({ sellerId: '', status: 'approved' }).success
      ).toBe(false);
      expect(
        SellerModerationInputSchema.safeParse({ sellerId: 's-1', status: 'invalid_status' }).success
      ).toBe(false);
    });
  });

  describe('CustomerModerationInputSchema & ProductModerationInputSchema', () => {
    it('accepts product moderation decision inputs', () => {
      expect(
        ProductModerationInputSchema.safeParse({
          productId: 'prod-01',
          status: 'approved',
          reason: 'Meets catalog guidelines',
        }).success
      ).toBe(true);

      expect(
        ReviewModerationInputSchema.safeParse({
          reviewId: 'rev-01',
          status: 'hidden',
          notes: 'Contains offensive link',
        }).success
      ).toBe(true);
    });

    it('accepts active and suspended status transitions', () => {
      expect(
        CustomerModerationInputSchema.safeParse({
          customerId: 'cust-123',
          status: 'suspended',
          note: 'Chargeback dispute hold',
        }).success
      ).toBe(true);

      expect(
        CustomerModerationInputSchema.safeParse({
          customerId: 'cust-123',
          status: 'active',
        }).success
      ).toBe(true);
    });
  });

  describe('CategoryAdminInputSchema', () => {
    it('validates taxonomy category creation payload', () => {
      const input = {
        slug: 'gaming-accessories',
        name: { en: 'Gaming Accessories', bn: 'গেমিং অ্যাকসেসরিজ' },
        parentId: 'cat-electronics',
        isActive: true,
        isFeatured: false,
      };
      expect(CategoryAdminInputSchema.safeParse(input).success).toBe(true);
    });
  });

  describe('RefundRequestSchema & ReturnRequestSchema', () => {
    it('validates monetary refund request with integer minor units', () => {
      const input = {
        id: 'ref-req-101',
        orderId: 'ord-1001',
        packageId: 'pkg-1001',
        customerId: 'cust-1',
        customerName: 'Sarah Jenkins',
        sellerId: 'seller-tech',
        sellerName: 'TechDirect',
        amount: { amountMinor: 4999, currency: 'USD' as const },
        reason: 'defective' as const,
        customerNote: 'Battery issue',
        status: 'pending' as const,
        createdAt: '2026-02-18T10:00:00Z',
      };
      expect(RefundRequestSchema.safeParse(input).success).toBe(true);

      const invalidAmount = { ...input, amount: { amountMinor: -50, currency: 'USD' as const } };
      expect(RefundRequestSchema.safeParse(invalidAmount).success).toBe(false);
    });

    it('validates physical return request items', () => {
      const input = {
        id: 'ret-101',
        orderId: 'ord-1001',
        packageId: 'pkg-1001',
        customerId: 'cust-1',
        customerName: 'Sarah Jenkins',
        sellerId: 'seller-tech',
        sellerName: 'TechDirect',
        items: [{ productId: 'prod-1', productName: 'Earbuds', quantity: 1 }],
        status: 'pending' as const,
        reason: 'damaged' as const,
        createdAt: '2026-02-18T10:00:00Z',
      };
      expect(ReturnRequestSchema.safeParse(input).success).toBe(true);
    });
  });

  describe('CouponSchema & PromotionSchema', () => {
    it('validates uppercase coupon code and discount conditions', () => {
      const coupon = {
        id: 'c-1',
        code: 'SUMMER25',
        discountType: 'percentage' as const,
        discountValue: 25,
        minPurchaseMinor: 5000,
        maxUsageCount: 200,
        currentUsageCount: 45,
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-08-31T23:59:59Z',
        isActive: true,
        description: 'Summer sale 25% off',
      };
      expect(CouponSchema.safeParse(coupon).success).toBe(true);

      // Rejects lowercase code
      expect(CouponSchema.safeParse({ ...coupon, code: 'summer25' }).success).toBe(false);
    });

    it('validates marketing promotion campaign', () => {
      const promo = {
        id: 'p-1',
        name: 'Spring Gala',
        description: 'Storewide technology event',
        badgeText: 'Spring Deal',
        discountPercent: 15,
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2026-04-15T23:59:59Z',
        isActive: true,
      };
      expect(PromotionSchema.safeParse(promo).success).toBe(true);
    });
  });

  describe('PlatformSettingsSchema', () => {
    it('validates platform configuration defaults', () => {
      const settings = {
        platformName: 'Nexus Marketplace',
        supportEmail: 'ops@nexus.demo',
        supportedLocales: ['en', 'bn', 'ar', 'hi'],
        defaultLocale: 'en',
        supportedCurrencies: ['USD', 'EUR'],
        defaultCurrency: 'USD',
        commission: {
          defaultCommissionPercent: 12.5,
          categoryOverrides: { 'cat-tech': 8.0 },
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
        updatedBy: 'Super Admin',
      };
      expect(PlatformSettingsSchema.safeParse(settings).success).toBe(true);
    });
  });

  describe('AdminAuditLogEntrySchema', () => {
    it('validates append-only audit log compliance record', () => {
      const log = {
        id: 'aud-1001',
        timestamp: '2026-02-20T10:00:00Z',
        actor: {
          id: 'admin-01',
          name: 'Super Admin',
          role: 'super_admin' as const,
        },
        action: 'SELLER_APPROVED',
        targetType: 'seller' as const,
        targetId: 'seller-tech-direct',
        outcome: 'success' as const,
      };
      expect(AdminAuditLogEntrySchema.safeParse(log).success).toBe(true);
    });
  });
});
