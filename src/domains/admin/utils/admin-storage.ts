/**
 * ==============================================================================
 * ADMIN DOMAIN — ADMIN PERSISTENCE UTILITIES
 * ==============================================================================
 * Safe local storage synchronization for admin mock workflows with SSR safety.
 */

import type { AdminUser } from '../types/admin';
import type { PlatformSettings } from '../types/settings';
import type { Coupon, Promotion } from '../types/promotion-coupon';
import type { RefundRequest, ReturnRequest } from '../types/refund-return';
import type { AdminProductReview } from '../types/review-moderation';
import type { AdminAuditLogEntry } from '../types/audit-log';
import type { AdminNotification } from '../types/notification';
import type { CustomerAdminSummary } from '../types/customer-management';

import { DEMO_SUPER_ADMIN } from '../fixtures/admin-users.fixture';
import { DEFAULT_PLATFORM_SETTINGS } from '../fixtures/platform-settings.fixture';
import { DEMO_COUPONS, DEMO_PROMOTIONS } from '../fixtures/coupons.fixture';
import { DEMO_REFUND_REQUESTS, DEMO_RETURN_REQUESTS } from '../fixtures/refunds-returns.fixture';
import { DEMO_ADMIN_REVIEWS } from '../fixtures/reviews-moderation.fixture';
import { DEMO_AUDIT_LOGS } from '../fixtures/audit-logs.fixture';
import { DEMO_ADMIN_NOTIFICATIONS } from '../fixtures/notifications.fixture';

const STORAGE_KEYS = {
  CURRENT_USER: 'marketplace_admin_user',
  SETTINGS: 'marketplace_admin_settings',
  COUPONS: 'marketplace_admin_coupons',
  PROMOTIONS: 'marketplace_admin_promotions',
  REFUNDS: 'marketplace_admin_refunds',
  RETURNS: 'marketplace_admin_returns',
  REVIEWS: 'marketplace_admin_reviews',
  AUDIT_LOGS: 'marketplace_admin_audit_logs',
  NOTIFICATIONS: 'marketplace_admin_notifications',
  CUSTOMERS: 'marketplace_admin_customers',
  PRODUCT_MODERATION: 'marketplace_admin_product_moderation',
  SELLER_MODERATION: 'marketplace_admin_seller_moderation',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

// Current Admin User
export function loadStoredAdminUser(): AdminUser {
  return getStoredItem<AdminUser>(STORAGE_KEYS.CURRENT_USER, DEMO_SUPER_ADMIN);
}

export function saveStoredAdminUser(user: AdminUser): void {
  setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
}

// Platform Settings
export function loadStoredSettings(): PlatformSettings {
  return getStoredItem<PlatformSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_PLATFORM_SETTINGS);
}

export function saveStoredSettings(settings: PlatformSettings): void {
  setStoredItem(STORAGE_KEYS.SETTINGS, settings);
}

// Coupons & Promotions
export function loadStoredCoupons(): Coupon[] {
  return getStoredItem<Coupon[]>(STORAGE_KEYS.COUPONS, DEMO_COUPONS);
}

export function saveStoredCoupons(coupons: Coupon[]): void {
  setStoredItem(STORAGE_KEYS.COUPONS, coupons);
}

export function loadStoredPromotions(): Promotion[] {
  return getStoredItem<Promotion[]>(STORAGE_KEYS.PROMOTIONS, DEMO_PROMOTIONS);
}

export function saveStoredPromotions(promos: Promotion[]): void {
  setStoredItem(STORAGE_KEYS.PROMOTIONS, promos);
}

// Refunds & Returns
export function loadStoredRefunds(): RefundRequest[] {
  return getStoredItem<RefundRequest[]>(STORAGE_KEYS.REFUNDS, DEMO_REFUND_REQUESTS);
}

export function saveStoredRefunds(refunds: RefundRequest[]): void {
  setStoredItem(STORAGE_KEYS.REFUNDS, refunds);
}

export function loadStoredReturns(): ReturnRequest[] {
  return getStoredItem<ReturnRequest[]>(STORAGE_KEYS.RETURNS, DEMO_RETURN_REQUESTS);
}

export function saveStoredReturns(returns: ReturnRequest[]): void {
  setStoredItem(STORAGE_KEYS.RETURNS, returns);
}

// Reviews
export function loadStoredReviews(): AdminProductReview[] {
  return getStoredItem<AdminProductReview[]>(STORAGE_KEYS.REVIEWS, DEMO_ADMIN_REVIEWS);
}

export function saveStoredReviews(reviews: AdminProductReview[]): void {
  setStoredItem(STORAGE_KEYS.REVIEWS, reviews);
}

// Audit Logs (append-only)
export function loadStoredAuditLogs(): AdminAuditLogEntry[] {
  return getStoredItem<AdminAuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, DEMO_AUDIT_LOGS);
}

export function appendStoredAuditLog(entry: AdminAuditLogEntry): void {
  const current = loadStoredAuditLogs();
  setStoredItem(STORAGE_KEYS.AUDIT_LOGS, [entry, ...current]);
}

// Notifications
export function loadStoredNotifications(): AdminNotification[] {
  return getStoredItem<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEMO_ADMIN_NOTIFICATIONS);
}

export function saveStoredNotifications(notifications: AdminNotification[]): void {
  setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

// Customers moderation list
export const INITIAL_DEMO_CUSTOMERS: CustomerAdminSummary[] = [
  {
    id: 'cust-demo-sarah',
    email: 'sarah.jenkins@example.com',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    phoneNumber: '+1 512-555-0199',
    status: 'active',
    totalOrders: 3,
    totalSpentMinor: 48900, // $489.00
    joinedAt: '2026-01-15T09:30:00Z',
    lastLoginAt: '2026-02-20T08:15:00Z',
    notes: ['Verified customer, top reviewer'],
    isDemo: true,
  },
  {
    id: 'cust-demo-michael',
    email: 'michael.chang@example.com',
    firstName: 'Michael',
    lastName: 'Chang',
    phoneNumber: '+1 415-555-0188',
    status: 'active',
    totalOrders: 1,
    totalSpentMinor: 4500, // $45.00
    joinedAt: '2026-02-01T14:20:00Z',
    lastLoginAt: '2026-02-18T19:00:00Z',
    notes: [],
    isDemo: true,
  },
  {
    id: 'cust-demo-suspended-01',
    email: 'flagged.buyer@spam-domain.org',
    firstName: 'Spammy',
    lastName: 'Bot',
    phoneNumber: '+1 800-555-0000',
    status: 'suspended',
    totalOrders: 0,
    totalSpentMinor: 0,
    joinedAt: '2026-02-17T21:00:00Z',
    lastLoginAt: '2026-02-17T21:05:00Z',
    notes: ['Suspended for automated chargeback patterns and fraudulent card attempts.'],
    isDemo: true,
  },
];

export function loadStoredCustomers(): CustomerAdminSummary[] {
  return getStoredItem<CustomerAdminSummary[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_DEMO_CUSTOMERS);
}

export function saveStoredCustomers(customers: CustomerAdminSummary[]): void {
  setStoredItem(STORAGE_KEYS.CUSTOMERS, customers);
}

// Status overrides maps
export function loadStoredProductModeration(): Record<string, string> {
  return getStoredItem<Record<string, string>>(STORAGE_KEYS.PRODUCT_MODERATION, {});
}

export function saveStoredProductModeration(record: Record<string, string>): void {
  setStoredItem(STORAGE_KEYS.PRODUCT_MODERATION, record);
}

export function loadStoredSellerModeration(): Record<string, string> {
  return getStoredItem<Record<string, string>>(STORAGE_KEYS.SELLER_MODERATION, {});
}

export function saveStoredSellerModeration(record: Record<string, string>): void {
  setStoredItem(STORAGE_KEYS.SELLER_MODERATION, record);
}

export function clearAdminStorage(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
}
