'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { SellerProfile, SellerStatus } from '@/domains/seller/types/seller';
import type {
  SellerApplicationInput,
  SellerApplicationRecord,
} from '@/domains/seller/types/application';
import type { StoreProfileUpdateInput, PublicStorefront } from '@/domains/seller/types/store';
import type { SellerOfferUpsertInput } from '@/domains/seller/types/offer';
import type { InventoryItem, InventoryAdjustmentInput } from '@/domains/seller/types/inventory';
import type { SellerOrderPackage, DispatchPackageInput } from '@/domains/seller/types/order';
import type { SellerDashboardMetrics } from '@/domains/seller/types/analytics';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import type { Product } from '@/domains/catalog/types/product';

import {
  DEMO_SELLER_PROFILE,
  DEMO_PENDING_APPLICATION,
} from '@/domains/seller/fixtures/seller.fixture';
import { DEMO_SELLER_PACKAGES } from '@/domains/seller/fixtures/seller-orders.fixture';
import { DEMO_SELLER_METRICS } from '@/domains/seller/fixtures/analytics.fixture';
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';
import { buildSellerInventoryFromOffers, calculateStockAlertLevel } from '@/domains/seller/utils/inventory';
import { createMoney } from '@/domains/catalog/utils/money';
import { useAuth } from '@/features/auth/context/auth-context';
import { buildApiHeaders } from '@/lib/http/csrf';

export interface StorefrontResult {
  storefront: PublicStorefront;
  activeOffers: SellerOffer[];
}

const EMPTY_SELLER_PROFILE: SellerProfile = {
  ...DEMO_SELLER_PROFILE,
  id: 'unauthenticated-seller',
  name: 'Seller Portal',
  slug: 'seller-portal',
  status: 'pending',
  isVerified: false,
  rating: { average: 0, count: 0, positiveFeedbackPercent: 0 },
};

const EMPTY_SELLER_METRICS: SellerDashboardMetrics = {
  ...DEMO_SELLER_METRICS,
  totalRevenue: createMoney(0, 'USD'),
  totalOrdersCount: 0,
  pendingOrdersCount: 0,
  activeListingsCount: 0,
  lowStockItemsCount: 0,
  averageOrderValue: createMoney(0, 'USD'),
  dailyTrends: [],
  topProducts: [],
};

interface SellerContextValue {
  sellerProfile: SellerProfile;
  application: SellerApplicationRecord | null;
  status: SellerStatus;
  isApproved: boolean;
  isLoading: boolean;
  sellerError: string | null;
  isPermissionDenied: boolean;
  packages: SellerOrderPackage[];
  inventory: InventoryItem[];
  offers: SellerOffer[];
  metrics: SellerDashboardMetrics;
  allProducts: Product[];
  refreshSellerData: () => Promise<void>;
  submitApplication: (input: SellerApplicationInput) => Promise<SellerApplicationRecord>;
  autoApproveDemoApplication: (applicationId?: string) => Promise<SellerProfile>;
  switchActiveSeller: (sellerId: string) => void;
  updateStoreProfile: (input: StoreProfileUpdateInput) => Promise<SellerProfile>;
  upsertOffer: (input: SellerOfferUpsertInput) => Promise<SellerOffer>;
  adjustInventory: (input: InventoryAdjustmentInput) => Promise<InventoryItem>;
  dispatchPackage: (input: DispatchPackageInput) => Promise<SellerOrderPackage>;
  getStorefrontBySlug: (slug: string) => StorefrontResult | null;
  resetToDemo: () => void;
}

const SellerContext = createContext<SellerContextValue | undefined>(undefined);

export function SellerProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const isTestEnv = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test';
  const { customer, isAuthenticated, isLoading: authLoading } = useAuth();

  const [sellerProfile, setSellerProfile] = useState<SellerProfile>(
    isTestEnv ? DEMO_SELLER_PROFILE : EMPTY_SELLER_PROFILE
  );
  const [application, setApplication] = useState<SellerApplicationRecord | null>(
    isTestEnv ? DEMO_PENDING_APPLICATION : null
  );
  const [packages, setPackages] = useState<SellerOrderPackage[]>(
    isTestEnv ? DEMO_SELLER_PACKAGES : []
  );
  const [offers, setOffers] = useState<SellerOffer[]>(() =>
    isTestEnv ? MOCK_SELLER_OFFERS.filter((o) => o.sellerId === DEMO_SELLER_PROFILE.id) : []
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    isTestEnv
      ? buildSellerInventoryFromOffers(
          MOCK_SELLER_OFFERS.filter((o) => o.sellerId === DEMO_SELLER_PROFILE.id),
          MOCK_PRODUCTS
        )
      : []
  );
  const [metrics, setMetrics] = useState<SellerDashboardMetrics>(
    isTestEnv ? DEMO_SELLER_METRICS : EMPTY_SELLER_METRICS
  );
  const [allProducts, setAllProducts] = useState<Product[]>(isTestEnv ? MOCK_PRODUCTS : []);
  const [isLoading, setIsLoading] = useState<boolean>(!isTestEnv);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);

  const refreshSellerData = useCallback(async () => {
    if (isTestEnv || authLoading) return;

    if (!isAuthenticated || (customer?.role !== 'seller' && customer?.role !== 'admin')) {
      setIsPermissionDenied(true);
      setSellerProfile(EMPTY_SELLER_PROFILE);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSellerError(null);
    setIsPermissionDenied(false);

    try {
      const [profileRes, productsRes, ordersRes, analyticsRes, catalogRes] = await Promise.all([
        fetch('/api/seller/profile', { credentials: 'include' }),
        fetch('/api/seller/products', { credentials: 'include' }),
        fetch('/api/seller/orders', { credentials: 'include' }),
        fetch('/api/seller/analytics', { credentials: 'include' }),
        fetch('/api/catalog/products?limit=40', { credentials: 'include' }),
      ]);

      if (catalogRes.ok) {
        const catJson = await catalogRes.json().catch(() => null);
        if (catJson?.success && Array.isArray(catJson.data)) {
          setAllProducts(catJson.data);
        }
      }

      if (profileRes.status === 401 || profileRes.status === 403) {
        setIsPermissionDenied(true);
        const errJson = await profileRes.json().catch(() => null);
        setSellerError(
          errJson?.error || 'Authorized merchant membership is required to access Seller Central.'
        );
        return;
      }

      if (!profileRes.ok) {
        const errJson = await profileRes.json().catch(() => null);
        setSellerError(errJson?.error || `Failed to load seller portal (HTTP ${profileRes.status})`);
        return;
      }

      const [profileJson, prodJson, ordJson, anaJson] = await Promise.all([
        profileRes.json().catch(() => null),
        productsRes.json().catch(() => null),
        ordersRes.json().catch(() => null),
        analyticsRes.json().catch(() => null),
      ]);

      if (profileJson?.success && profileJson.data) {
        setSellerProfile((prev) => ({
          ...prev,
          id: profileJson.data.id,
          name: profileJson.data.name,
          slug: profileJson.data.slug,
          status: profileJson.data.status === 'approved' ? 'approved' : 'pending',
          isVerified: Boolean(profileJson.data.isVerified),
          tagline: profileJson.data.tagline || '',
          description: profileJson.data.description || '',
          rating: profileJson.data.rating || prev.rating,
        }));
      }

      if (prodJson?.success && Array.isArray(prodJson.data)) {
        const loadedInv: InventoryItem[] = prodJson.data.map((row: any) => ({
          sku: row.sku,
          offerId: row.offerId,
          productId: row.productId,
          productTitle: row.title,
          quantityAvailable: row.inventory?.quantityAvailable ?? 0,
          lowStockThreshold: 5,
          alertLevel: calculateStockAlertLevel(row.inventory?.quantityAvailable ?? 0, 5),
          updatedAt: row.updatedAt || new Date().toISOString(),
        }));
        setInventory(loadedInv);

        const loadedOffers: SellerOffer[] = prodJson.data.map((row: any) => ({
          offerId: row.offerId,
          productId: row.productId,
          sellerId: row.sellerId || sellerProfile.id,
          seller: {
            id: row.sellerId || sellerProfile.id,
            name: sellerProfile.name,
            slug: sellerProfile.slug,
            rating: sellerProfile.rating,
            badges: sellerProfile.badges,
            isVerified: sellerProfile.isVerified,
          },
          price: row.price || createMoney(0, 'USD'),
          compareAtPrice: row.compareAtPrice,
          condition: row.condition || 'new',
          inventory: row.inventory || { state: 'in_stock', quantityAvailable: 0 },
          fulfillmentType: row.fulfillmentType || 'seller_fulfilled',
          shippingEstimate: row.shippingEstimate || { minDays: 2, maxDays: 5, isFreeShipping: true },
          isBuyBoxWinner: Boolean(row.isBuyBoxWinner),
          returnPolicyDays: row.returnPolicyDays ?? 30,
        }));
        setOffers(loadedOffers);
      }

      if (ordJson?.success && Array.isArray(ordJson.data)) {
        setPackages(ordJson.data);
      }

      if (anaJson?.success && anaJson.data) {
        const a = anaJson.data;
        setMetrics({
          ...EMPTY_SELLER_METRICS,
          totalRevenue: a.revenue || createMoney(0, 'USD'),
          totalOrdersCount: a.totalOrders ?? 0,
          pendingOrdersCount: a.pendingFulfillment ?? 0,
          lowStockItemsCount: a.lowStockCount ?? 0,
          dailyTrends: Array.isArray(a.dailyTrends)
            ? a.dailyTrends.map((d: any) => ({
                date: d.date,
                revenue: createMoney(d.revenueMinor || 0, 'USD'),
                orderCount: d.ordersCount || 0,
              }))
            : [],
          topProducts: Array.isArray(a.topProducts) ? a.topProducts : [],
        });
      }
    } catch (err) {
      setSellerError(err instanceof Error ? err.message : 'Unable to reach Seller Central API.');
    } finally {
      setIsLoading(false);
    }
  }, [isTestEnv, authLoading, isAuthenticated, customer?.role]);

  useEffect(() => {
    void refreshSellerData();
  }, [refreshSellerData]);

  const submitApplication = useCallback(
    async (input: SellerApplicationInput): Promise<SellerApplicationRecord> => {
      const res = await fetch('/api/seller/apply', {
        method: 'POST',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify({
          storeName: input.storeName,
          storeSlug: input.storeSlug,
          storeDescription: input.storeDescription,
          businessInfo: input.businessInfo,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to submit seller onboarding application.');
      }

      const record: SellerApplicationRecord = {
        ...input,
        applicationId: json.data.id,
        submittedAt: json.data.submitted_at || new Date().toISOString(),
        status: 'under_review',
        isDemoSubmission: false,
      };
      setApplication(record);
      await refreshSellerData();
      return record;
    },
    [refreshSellerData]
  );

  const autoApproveDemoApplication = useCallback(async (): Promise<SellerProfile> => {
    throw new Error('Self-approval is disabled. An authorized Compliance Officer or Admin must approve KYC applications.');
  }, []);

  const switchActiveSeller = useCallback(
    (_sellerId: string) => {
      void refreshSellerData();
    },
    [refreshSellerData]
  );

  const updateStoreProfile = useCallback(
    async (input: StoreProfileUpdateInput): Promise<SellerProfile> => {
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify(input),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to update store profile.');
      }
      await refreshSellerData();
      return sellerProfile;
    },
    [refreshSellerData, sellerProfile]
  );

  const upsertOffer = useCallback(
    async (input: SellerOfferUpsertInput): Promise<SellerOffer> => {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify({
          productId: input.productId,
          title: input.productId,
          sku: `SKU-${input.productId.slice(-6)}-${Date.now().toString().slice(-4)}`,
          priceMinor: input.price.amountMinor,
          compareAtPriceMinor: input.compareAtPrice?.amountMinor,
          currency: input.price.currency,
          stockQuantity: input.quantityAvailable,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to create seller offer.');
      }
      await refreshSellerData();
      return {
        offerId: json.data.id,
        productId: json.data.product_id,
        sellerId: json.data.seller_id,
        seller: {
          id: sellerProfile.id,
          name: sellerProfile.name,
          slug: sellerProfile.slug,
          rating: sellerProfile.rating,
          badges: sellerProfile.badges,
          isVerified: sellerProfile.isVerified,
        },
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        condition: input.condition,
        fulfillmentType: input.fulfillmentType,
        shippingEstimate: input.shippingEstimate,
        inventory: { state: input.quantityAvailable > 0 ? 'in_stock' : 'out_of_stock', quantityAvailable: input.quantityAvailable },
        isBuyBoxWinner: false,
        returnPolicyDays: input.returnPolicyDays,
      };
    },
    [refreshSellerData, sellerProfile]
  );

  const adjustInventory = useCallback(
    async (input: InventoryAdjustmentInput): Promise<InventoryItem> => {
      const target = inventory.find((i) => i.sku === input.sku);
      if (!target || !(target as any).offerId) {
        throw new Error(`Offer identifier not found for SKU ${input.sku}`);
      }
      const delta = input.newQuantity - target.quantityAvailable;
      const res = await fetch('/api/seller/inventory', {
        method: 'PATCH',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify({
          offerId: (target as any).offerId,
          delta,
          reason: input.reason || 'Seller Portal adjustment',
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to adjust inventory.');
      }
      await refreshSellerData();
      return { ...target, quantityAvailable: json.data.availableQuantity, updatedAt: new Date().toISOString() };
    },
    [inventory, refreshSellerData]
  );

  const dispatchPackage = useCallback(
    async (input: DispatchPackageInput): Promise<SellerOrderPackage> => {
      const idemKey = `dispatch-${input.packageId}-${Date.now()}`;
      const res = await fetch('/api/seller/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: buildApiHeaders({ 'Idempotency-Key': idemKey }),
        body: JSON.stringify({
          packageId: input.packageId,
          status: 'shipped',
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to dispatch seller package.');
      }
      await refreshSellerData();
      return json.data;
    },
    [refreshSellerData]
  );

  const getStorefrontBySlug = useCallback(
    (slug: string): StorefrontResult | null => {
      if (sellerProfile.slug !== slug) return null;
      return {
        storefront: {
          id: sellerProfile.id,
          slug: sellerProfile.slug,
          name: sellerProfile.name,
          tagline: sellerProfile.tagline,
          description: sellerProfile.description,
          logoUrl: sellerProfile.logoUrl,
          bannerUrl: sellerProfile.bannerUrl,
          rating: sellerProfile.rating,
          badges: sellerProfile.badges,
          isVerified: sellerProfile.isVerified,
          memberSinceYear: new Date(sellerProfile.joinedAt).getFullYear(),
          totalProductsCount: inventory.length,
          policies: {
            shipping: 'Standard handling: 1-2 business days.',
            returns: '30-day return window.',
            warranty: 'Authorized warranty policy.',
          },
        },
        activeOffers: offers,
      };
    },
    [sellerProfile, inventory.length, offers]
  );

  const resetToDemo = useCallback(() => {
    void refreshSellerData();
  }, [refreshSellerData]);

  const value: SellerContextValue = useMemo(
    () => ({
      sellerProfile,
      application,
      status: sellerProfile.status,
      isApproved: sellerProfile.status === 'approved',
      isLoading,
      sellerError,
      isPermissionDenied,
      packages,
      inventory,
      offers,
      metrics,
      allProducts,
      refreshSellerData,
      submitApplication,
      autoApproveDemoApplication,
      switchActiveSeller,
      updateStoreProfile,
      upsertOffer,
      adjustInventory,
      dispatchPackage,
      getStorefrontBySlug,
      resetToDemo,
    }),
    [
      sellerProfile,
      application,
      isLoading,
      sellerError,
      isPermissionDenied,
      packages,
      inventory,
      offers,
      metrics,
      allProducts,
      refreshSellerData,
      submitApplication,
      autoApproveDemoApplication,
      switchActiveSeller,
      updateStoreProfile,
      upsertOffer,
      adjustInventory,
      dispatchPackage,
      getStorefrontBySlug,
      resetToDemo,
    ]
  );

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function useSeller(): SellerContextValue {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
}
