/**
 * ==============================================================================
 * SELLER DOMAIN — STORAGE & PERSISTENCE ENGINE
 * ==============================================================================
 * Isolates demo seller persistence in browser localStorage with hydration safety.
 */

import type { SellerProfile } from '../types/seller';
import type { SellerApplicationRecord } from '../types/application';
import type { SellerOrderPackage } from '../types/order';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { DEMO_SELLER_PROFILE, DEMO_PENDING_APPLICATION } from '../fixtures/seller.fixture';
import { DEMO_SELLER_PACKAGES } from '../fixtures/seller-orders.fixture';
import { MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures/seller-offers.fixture';

export const SELLER_PROFILE_STORAGE_KEY = 'marketplace_seller_profile_v1';
export const SELLER_APPLICATIONS_STORAGE_KEY = 'marketplace_seller_applications_v1';
export const SELLER_PACKAGES_STORAGE_KEY = 'marketplace_seller_packages_v1';
export const SELLER_OFFERS_STORAGE_KEY = 'marketplace_seller_offers_v1';

export function getStoredSellerProfile(): SellerProfile {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEMO_SELLER_PROFILE;
  }
  try {
    const raw = window.localStorage.getItem(SELLER_PROFILE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SellerProfile;
    }
  } catch {
    // fallback
  }
  return DEMO_SELLER_PROFILE;
}

export function saveStoredSellerProfile(profile: SellerProfile): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SELLER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // fallback
  }
}

export function getStoredSellerApplications(): SellerApplicationRecord[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [DEMO_PENDING_APPLICATION];
  }
  try {
    const raw = window.localStorage.getItem(SELLER_APPLICATIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SellerApplicationRecord[];
    }
  } catch {
    // fallback
  }
  return [DEMO_PENDING_APPLICATION];
}

export function saveSellerApplication(application: SellerApplicationRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const current = getStoredSellerApplications();
    const updated = [
      application,
      ...current.filter((a) => a.applicationId !== application.applicationId),
    ];
    window.localStorage.setItem(SELLER_APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

export function getStoredSellerPackages(sellerId: string): SellerOrderPackage[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEMO_SELLER_PACKAGES.filter((p) => p.sellerId === sellerId);
  }
  try {
    const raw = window.localStorage.getItem(SELLER_PACKAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SellerOrderPackage[];
      return parsed.filter((p) => p.sellerId === sellerId);
    }
  } catch {
    // fallback
  }
  return DEMO_SELLER_PACKAGES.filter((p) => p.sellerId === sellerId);
}

export function saveStoredSellerPackage(updatedPkg: SellerOrderPackage): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(SELLER_PACKAGES_STORAGE_KEY);
    const list: SellerOrderPackage[] = raw ? JSON.parse(raw) : DEMO_SELLER_PACKAGES;
    const index = list.findIndex((p) => p.packageId === updatedPkg.packageId);
    if (index >= 0) {
      list[index] = updatedPkg;
    } else {
      list.unshift(updatedPkg);
    }
    window.localStorage.setItem(SELLER_PACKAGES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // fallback
  }
}

export function getStoredSellerOffers(sellerId: string): SellerOffer[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return MOCK_SELLER_OFFERS.filter((o) => o.sellerId === sellerId);
  }
  try {
    const raw = window.localStorage.getItem(SELLER_OFFERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SellerOffer[];
      return parsed.filter((o) => o.sellerId === sellerId);
    }
  } catch {
    // fallback
  }
  return MOCK_SELLER_OFFERS.filter((o) => o.sellerId === sellerId);
}

export function saveStoredSellerOffer(offer: SellerOffer): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(SELLER_OFFERS_STORAGE_KEY);
    const list: SellerOffer[] = raw ? JSON.parse(raw) : MOCK_SELLER_OFFERS;
    const index = list.findIndex((o) => o.offerId === offer.offerId);
    if (index >= 0) {
      list[index] = offer;
    } else {
      list.unshift(offer);
    }
    window.localStorage.setItem(SELLER_OFFERS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // fallback
  }
}
