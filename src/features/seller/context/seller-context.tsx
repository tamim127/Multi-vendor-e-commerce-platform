'use client';

/**
 * ==============================================================================
 * SELLER CONTEXT & PROVIDER
 * ==============================================================================
 * Comprehensive state management for the marketplace seller portal.
 * Manages seller profile, onboarding applications, multi-vendor order packages,
 * SKU inventory, commercial offers, and sales analytics.
 */

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
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS, MOCK_SELLERS } from '@/domains/catalog/fixtures';

import {
  getStoredSellerProfile,
  saveStoredSellerProfile,
  getStoredSellerApplications,
  saveSellerApplication,
  getStoredSellerPackages,
  saveStoredSellerPackage,
  getStoredSellerOffers,
  saveStoredSellerOffer,
} from '@/domains/seller/utils/seller-storage';
import {
  calculateStockAlertLevel,
  buildSellerInventoryFromOffers,
} from '@/domains/seller/utils/inventory';

export interface StorefrontResult {
  storefront: PublicStorefront;
  activeOffers: SellerOffer[];
}

interface SellerContextValue {
  sellerProfile: SellerProfile;
  application: SellerApplicationRecord | null;
  status: SellerStatus;
  isApproved: boolean;
  isLoading: boolean;
  packages: SellerOrderPackage[];
  inventory: InventoryItem[];
  offers: SellerOffer[];
  metrics: SellerDashboardMetrics;
  allProducts: Product[];
  // Actions
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
  const [isClient, setIsClient] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>(DEMO_SELLER_PROFILE);
  const [application, setApplication] = useState<SellerApplicationRecord | null>(null);
  const [packages, setPackages] = useState<SellerOrderPackage[]>(DEMO_SELLER_PACKAGES);
  const [offers, setOffers] = useState<SellerOffer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state safely on client mount
  useEffect(() => {
    setIsClient(true);

    // Load stored profile or fallback to demo
    const activeProfile = getStoredSellerProfile();
    setSellerProfile(activeProfile);

    // Load applications
    const apps = getStoredSellerApplications();
    if (apps.length > 0 && apps[0]) {
      setApplication(apps[0]);
    } else {
      setApplication(DEMO_PENDING_APPLICATION);
    }

    // Load stored packages
    const storedPkgs = getStoredSellerPackages(activeProfile.id);
    if (storedPkgs.length > 0) {
      setPackages(storedPkgs);
    } else {
      setPackages(DEMO_SELLER_PACKAGES);
    }

    // Load offers for this seller
    const storedOffers = getStoredSellerOffers(activeProfile.id);
    const sellerSpecificOffers =
      storedOffers.length > 0
        ? storedOffers
        : MOCK_SELLER_OFFERS.filter((o) => o.sellerId === activeProfile.id);
    setOffers(sellerSpecificOffers);

    // Build inventory from offers
    const initialInventory = buildSellerInventoryFromOffers(sellerSpecificOffers, MOCK_PRODUCTS);
    setInventory(initialInventory);

    setIsLoading(false);
  }, []);

  // Update inventory whenever offers change
  useEffect(() => {
    if (!sellerProfile) return;
    const inv = buildSellerInventoryFromOffers(offers, MOCK_PRODUCTS);
    setInventory(inv);
  }, [offers, sellerProfile]);

  // Submit onboarding application
  const submitApplication = useCallback(
    async (input: SellerApplicationInput): Promise<SellerApplicationRecord> => {
      const newApp: SellerApplicationRecord = {
        ...input,
        applicationId: `app-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'under_review',
        isDemoSubmission: true,
      };

      saveSellerApplication(newApp);
      setApplication(newApp);

      const pendingProfile: SellerProfile = {
        ...DEMO_SELLER_PROFILE,
        name: input.storeName,
        slug: input.storeSlug,
        status: 'pending',
        businessInfo: input.businessInfo,
        tagline: 'Pending Compliance Review',
        description: input.storeDescription,
        updatedAt: new Date().toISOString(),
      };
      saveStoredSellerProfile(pendingProfile);
      setSellerProfile(pendingProfile);

      return newApp;
    },
    []
  );

  // Simulate Instant Demo Approval
  const autoApproveDemoApplication = useCallback(
    async (applicationId?: string): Promise<SellerProfile> => {
      const appToApprove = application ?? DEMO_PENDING_APPLICATION;
      const approvedApp: SellerApplicationRecord = {
        ...appToApprove,
        applicationId: applicationId ?? appToApprove.applicationId,
        status: 'approved',
        decidedAt: new Date().toISOString(),
        reviewerNotes: 'Instant demo approval granted for evaluation.',
      };

      saveSellerApplication(approvedApp);
      setApplication(approvedApp);

      const approvedProfile: SellerProfile = {
        ...DEMO_SELLER_PROFILE,
        name: approvedApp.storeName,
        slug: approvedApp.storeSlug,
        status: 'approved',
        businessInfo: approvedApp.businessInfo,
        tagline: 'Marketplace Verified Merchant',
        description: approvedApp.storeDescription,
        updatedAt: new Date().toISOString(),
      };

      saveStoredSellerProfile(approvedProfile);
      setSellerProfile(approvedProfile);
      return approvedProfile;
    },
    [application]
  );

  // Switch Active Seller (for demo / testing multi-vendor switching)
  const switchActiveSeller = useCallback((sellerId: string) => {
    if (sellerId === DEMO_SELLER_PROFILE.id) {
      setSellerProfile(DEMO_SELLER_PROFILE);
      saveStoredSellerProfile(DEMO_SELLER_PROFILE);
    }
  }, []);

  // Update Store Profile
  const updateStoreProfile = useCallback(
    async (input: StoreProfileUpdateInput): Promise<SellerProfile> => {
      const updatedProfile: SellerProfile = {
        ...sellerProfile,
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        logoUrl: input.logoUrl,
        bannerUrl: input.bannerUrl,
        fulfillmentSettings: input.fulfillmentSettings,
        updatedAt: new Date().toISOString(),
      };

      saveStoredSellerProfile(updatedProfile);
      setSellerProfile(updatedProfile);
      return updatedProfile;
    },
    [sellerProfile]
  );

  // Upsert Offer (pricing, discount, active status)
  const upsertOffer = useCallback(
    async (input: SellerOfferUpsertInput): Promise<SellerOffer> => {
      const existingIndex = offers.findIndex(
        (o) => o.productId === input.productId && o.variantId === input.variantId
      );

      let updatedOffer: SellerOffer;

      if (existingIndex >= 0 && offers[existingIndex]) {
        const existing = offers[existingIndex]!;
        updatedOffer = {
          ...existing,
          price: input.price,
          compareAtPrice: input.compareAtPrice,
          condition: input.condition,
          fulfillmentType: input.fulfillmentType,
          shippingEstimate: input.shippingEstimate,
          warranty: input.warranty,
          returnPolicyDays: input.returnPolicyDays,
          inventory: {
            ...existing.inventory,
            state: input.quantityAvailable > 0 ? 'in_stock' : 'out_of_stock',
            quantityAvailable: input.quantityAvailable,
          },
        };
      } else {
        updatedOffer = {
          offerId: `offer-${sellerProfile.id}-${input.productId}-${Date.now()}`,
          sellerId: sellerProfile.id,
          seller: {
            id: sellerProfile.id,
            name: sellerProfile.name,
            slug: sellerProfile.slug,
            rating: sellerProfile.rating,
            badges: sellerProfile.badges,
            isVerified: sellerProfile.isVerified,
          },
          productId: input.productId,
          variantId: input.variantId,
          price: input.price,
          compareAtPrice: input.compareAtPrice,
          condition: input.condition,
          fulfillmentType: input.fulfillmentType,
          shippingEstimate: input.shippingEstimate,
          warranty: input.warranty,
          returnPolicyDays: input.returnPolicyDays,
          isBuyBoxWinner: false,
          inventory: {
            state: input.quantityAvailable > 0 ? 'in_stock' : 'out_of_stock',
            quantityAvailable: input.quantityAvailable,
            lowStockThreshold: 10,
          },
        };
      }

      saveStoredSellerOffer(updatedOffer);

      setOffers((prev) => {
        const next = [...prev];
        if (existingIndex >= 0) {
          next[existingIndex] = updatedOffer;
        } else {
          next.push(updatedOffer);
        }
        return next;
      });

      return updatedOffer;
    },
    [sellerProfile, offers]
  );

  // Adjust Inventory
  const adjustInventory = useCallback(
    async (input: InventoryAdjustmentInput): Promise<InventoryItem> => {
      const targetItem = inventory.find((i) => i.sku === input.sku);
      if (!targetItem) throw new Error(`SKU ${input.sku} not found`);

      const updatedQty = input.newQuantity;
      const updatedItem: InventoryItem = {
        ...targetItem,
        quantityAvailable: updatedQty,
        alertLevel: calculateStockAlertLevel(updatedQty, targetItem.lowStockThreshold),
        updatedAt: new Date().toISOString(),
      };

      setInventory((prev) => prev.map((item) => (item.sku === input.sku ? updatedItem : item)));

      // Also sync offer inventory
      const matchingOffer = offers.find(
        (o) => o.productId === targetItem.productId && o.variantId === targetItem.variantId
      );
      if (matchingOffer) {
        const updatedOffer: SellerOffer = {
          ...matchingOffer,
          inventory: {
            ...matchingOffer.inventory,
            state: updatedQty > 0 ? 'in_stock' : 'out_of_stock',
            quantityAvailable: updatedQty,
          },
        };
        saveStoredSellerOffer(updatedOffer);
        setOffers((prev) =>
          prev.map((o) => (o.offerId === matchingOffer.offerId ? updatedOffer : o))
        );
      }

      return updatedItem;
    },
    [inventory, offers]
  );

  // Dispatch Package (fulfill multi-vendor package)
  const dispatchPackage = useCallback(
    async (input: DispatchPackageInput): Promise<SellerOrderPackage> => {
      const pkgIndex = packages.findIndex((p) => p.packageId === input.packageId);
      if (pkgIndex < 0) throw new Error(`Package ${input.packageId} not found`);

      const currentPkg = packages[pkgIndex]!;
      const dispatchedPkg: SellerOrderPackage = {
        ...currentPkg,
        status: 'shipped',
        carrier: input.carrier,
        trackingNumber: input.trackingNumber,
        dispatchedAt: new Date().toISOString(),
      };

      saveStoredSellerPackage(dispatchedPkg);
      setPackages((prev) => {
        const next = [...prev];
        next[pkgIndex] = dispatchedPkg;
        return next;
      });

      return dispatchedPkg;
    },
    [packages]
  );

  // Public Storefront lookup by slug
  const getStorefrontBySlug = useCallback(
    (slug: string): StorefrontResult | null => {
      let targetProfile: SellerProfile | null = null;

      if (sellerProfile && sellerProfile.slug === slug) {
        targetProfile = sellerProfile;
      } else if (DEMO_SELLER_PROFILE.slug === slug) {
        targetProfile = DEMO_SELLER_PROFILE;
      }

      if (targetProfile) {
        const activeOffers = offers.filter((o: SellerOffer) => o.sellerId === targetProfile!.id);

        const storefront: PublicStorefront = {
          id: targetProfile.id,
          slug: targetProfile.slug,
          name: targetProfile.name,
          tagline: targetProfile.tagline,
          description: targetProfile.description,
          logoUrl: targetProfile.logoUrl,
          bannerUrl: targetProfile.bannerUrl,
          rating: targetProfile.rating,
          badges: targetProfile.badges,
          isVerified: targetProfile.isVerified,
          memberSinceYear: new Date(targetProfile.joinedAt).getFullYear(),
          totalProductsCount: activeOffers.length,
          policies: {
            shipping: `Standard handling: ${targetProfile.fulfillmentSettings.standardHandlingDays} day(s). Insured delivery.`,
            returns: `${targetProfile.fulfillmentSettings.returnWindowDays}-day return window on factory-sealed items.`,
            warranty: 'Comprehensive 1-year authorized manufacturer warranty included.',
          },
        };

        return {
          storefront,
          activeOffers,
        };
      }

      // Check catalog mock sellers
      const matchedMockSeller = MOCK_SELLERS.find((s) => s.slug === slug);
      if (matchedMockSeller) {
        const activeOffers = offers.filter((o: SellerOffer) => o.sellerId === matchedMockSeller.id);

        const storefront: PublicStorefront = {
          id: matchedMockSeller.id,
          slug: matchedMockSeller.slug,
          name: matchedMockSeller.name,
          tagline: 'Authorized marketplace merchant offering certified authentic inventory.',
          description: `${matchedMockSeller.name} is a verified merchant on Enterprise Multi-Vendor Marketplace, providing high-quality catalog selection with insured carrier shipping and certified warranty protection.`,
          logoUrl: matchedMockSeller.logoUrl,
          bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
          rating: matchedMockSeller.rating,
          badges: matchedMockSeller.badges,
          isVerified: matchedMockSeller.isVerified,
          memberSinceYear: 2023,
          totalProductsCount: activeOffers.length,
          policies: {
            shipping:
              'Standard handling: 1-2 business days. Express domestic and international carrier tracking.',
            returns: '30-day return policy for unopened items in original retail packaging.',
            warranty: 'Comprehensive authorized manufacturer warranty included on all items.',
          },
        };

        return {
          storefront,
          activeOffers,
        };
      }

      return null;
    },
    [sellerProfile, offers]
  );

  // Reset to Demo
  const resetToDemo = useCallback(() => {
    setSellerProfile(DEMO_SELLER_PROFILE);
    saveStoredSellerProfile(DEMO_SELLER_PROFILE);
    setPackages(DEMO_SELLER_PACKAGES);
    const sellerSpecificOffers = MOCK_SELLER_OFFERS.filter(
      (o: SellerOffer) => o.sellerId === DEMO_SELLER_PROFILE.id
    );
    setOffers(sellerSpecificOffers);
    setInventory(buildSellerInventoryFromOffers(sellerSpecificOffers, MOCK_PRODUCTS));
  }, []);

  const value: SellerContextValue = useMemo(
    () => ({
      sellerProfile,
      application,
      status: sellerProfile.status,
      isApproved: sellerProfile.status === 'approved',
      isLoading: !isClient && isLoading,
      packages,
      inventory,
      offers,
      metrics: DEMO_SELLER_METRICS,
      allProducts: MOCK_PRODUCTS,
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
      isClient,
      isLoading,
      packages,
      inventory,
      offers,
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
