'use client';

/**
 * ==============================================================================
 * ADMIN PLATFORM — GLOBAL CONTEXT & STATE ENGINE
 * ==============================================================================
 * Central administrative state management providing role-based capability gating,
 * audit logging, moderation operations, platform settings, and live demo role switching.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  AdminUser,
  AdminRole,
  AdminPermission,
  PlatformSettings,
  SellerStatus,
  CustomerAccountStatus,
  CustomerAdminSummary,
  ProductModerationStatus,
  CategoryAdminInput,
  RefundStatus,
  ReturnStatus,
  RefundRequest,
  ReturnRequest,
  Coupon,
  Promotion,
  ReviewModerationStatus,
  AdminProductReview,
  AdminAuditLogEntry,
  AuditTargetType,
  AdminNotification,
  AdminOrderTimelineEvent,
} from '@/domains/admin';
import type { CustomerOrder } from '@/domains/customer/types/order';
import type { Category } from '@/domains/catalog/types/category';
import type { SellerApplicationRecord } from '@/domains/seller/types/application';

import {
  DEMO_SUPER_ADMIN,
  DEMO_ADMIN_USERS,
  DEFAULT_PLATFORM_SETTINGS,
  DEMO_COUPONS,
  DEMO_PROMOTIONS,
  DEMO_REFUND_REQUESTS,
  DEMO_RETURN_REQUESTS,
  DEMO_ADMIN_REVIEWS,
  DEMO_AUDIT_LOGS,
  DEMO_ADMIN_NOTIFICATIONS,
  hasPermission as evaluatePermission,
  hasAnyPermission as evaluateAnyPermission,
  hasAllPermissions as evaluateAllPermissions,
  loadStoredAdminUser,
  saveStoredAdminUser,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredCoupons,
  saveStoredCoupons,
  loadStoredPromotions,
  saveStoredPromotions,
  loadStoredRefunds,
  saveStoredRefunds,
  loadStoredReturns,
  saveStoredReturns,
  loadStoredReviews,
  saveStoredReviews,
  loadStoredAuditLogs,
  appendStoredAuditLog,
  loadStoredNotifications,
  saveStoredNotifications,
  loadStoredCustomers,
  saveStoredCustomers,
  loadStoredProductModeration,
  saveStoredProductModeration,
  loadStoredSellerModeration,
  saveStoredSellerModeration,
  clearAdminStorage,
} from '@/domains/admin';

import { MOCK_CATEGORIES } from '@/domains/catalog/fixtures/categories.fixture';
import { DEMO_PENDING_APPLICATION } from '@/domains/seller/fixtures/seller.fixture';
import { DEMO_ORDERS } from '@/domains/customer/fixtures/orders.fixture';

export interface AdminContextType {
  currentUser: AdminUser;
  currentRole: AdminRole;
  setCurrentRole: (role: AdminRole) => void;
  availableUsers: AdminUser[];
  switchUser: (userId: string) => void;

  hasPermission: (permission: AdminPermission) => boolean;
  hasAnyPermission: (permissions: AdminPermission[]) => boolean;
  hasAllPermissions: (permissions: AdminPermission[]) => boolean;

  settings: PlatformSettings;
  updateSettings: (updated: Partial<PlatformSettings>) => Promise<void>;

  sellerApplications: SellerApplicationRecord[];
  sellerStatuses: Record<string, SellerStatus>;
  moderateSeller: (
    sellerId: string,
    status: SellerStatus,
    reason?: string,
    notes?: string
  ) => Promise<void>;

  customers: CustomerAdminSummary[];
  moderateCustomer: (
    customerId: string,
    status: CustomerAccountStatus,
    note?: string
  ) => Promise<void>;

  productStatuses: Record<string, ProductModerationStatus>;
  moderateProduct: (
    productId: string,
    status: ProductModerationStatus,
    reason?: string,
    notes?: string
  ) => Promise<void>;

  categories: Category[];
  addCategory: (input: CategoryAdminInput) => Promise<void>;
  toggleCategoryActive: (categoryId: string) => Promise<void>;

  orders: CustomerOrder[];
  orderTimelineNotes: Record<string, AdminOrderTimelineEvent[]>;
  addOrderTimelineNote: (orderId: string, note: string) => Promise<void>;

  refunds: RefundRequest[];
  returns: ReturnRequest[];
  reviewRefund: (refundId: string, status: RefundStatus, adminNote?: string) => Promise<void>;
  reviewReturn: (returnId: string, status: ReturnStatus, adminNote?: string) => Promise<void>;

  coupons: Coupon[];
  promotions: Promotion[];
  createCoupon: (input: Omit<Coupon, 'id' | 'currentUsageCount'>) => Promise<void>;
  toggleCouponActive: (couponId: string) => Promise<void>;
  createPromotion: (input: Omit<Promotion, 'id'>) => Promise<void>;

  reviews: AdminProductReview[];
  moderateReview: (
    reviewId: string,
    status: ReviewModerationStatus,
    notes?: string
  ) => Promise<void>;

  auditLogs: AdminAuditLogEntry[];
  logAuditEvent: (
    action: string,
    targetType: AuditTargetType,
    targetId: string,
    metadata?: Record<string, unknown>,
    outcome?: 'success' | 'failure' | 'denied'
  ) => void;

  notifications: AdminNotification[];
  markNotificationRead: (notificationId: string) => void;
  clearAllNotifications: () => void;

  resetAllToDemo: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<AdminUser>(DEMO_SUPER_ADMIN);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [coupons, setCoupons] = useState<Coupon[]>(DEMO_COUPONS);
  const [promotions, setPromotions] = useState<Promotion[]>(DEMO_PROMOTIONS);
  const [refunds, setRefunds] = useState<RefundRequest[]>(DEMO_REFUND_REQUESTS);
  const [returns, setReturns] = useState<ReturnRequest[]>(DEMO_RETURN_REQUESTS);
  const [reviews, setReviews] = useState<AdminProductReview[]>(DEMO_ADMIN_REVIEWS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>(DEMO_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AdminNotification[]>(DEMO_ADMIN_NOTIFICATIONS);
  const [customers, setCustomers] = useState<CustomerAdminSummary[]>([]);
  const [productStatuses, setProductStatuses] = useState<Record<string, ProductModerationStatus>>(
    {}
  );
  const [sellerStatuses, setSellerStatuses] = useState<Record<string, SellerStatus>>({
    'seller-tech-direct': 'approved',
    'seller-official-flagship': 'approved',
    'seller-global-ware': 'approved',
    'seller-nordic-audio': 'pending',
  });
  const [sellerApplications] = useState<SellerApplicationRecord[]>([DEMO_PENDING_APPLICATION]);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [orders] = useState<CustomerOrder[]>(DEMO_ORDERS);
  const [orderTimelineNotes, setOrderTimelineNotes] = useState<
    Record<string, AdminOrderTimelineEvent[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate from localStorage on client
  useEffect(() => {
    try {
      setCurrentUser(loadStoredAdminUser());
      setSettings(loadStoredSettings());
      setCoupons(loadStoredCoupons());
      setPromotions(loadStoredPromotions());
      setRefunds(loadStoredRefunds());
      setReturns(loadStoredReturns());
      setReviews(loadStoredReviews());
      setAuditLogs(loadStoredAuditLogs());
      setNotifications(loadStoredNotifications());
      setCustomers(loadStoredCustomers());
      setProductStatuses(loadStoredProductModeration() as Record<string, ProductModerationStatus>);
      const storedSellers = loadStoredSellerModeration() as Record<string, SellerStatus>;
      if (Object.keys(storedSellers).length > 0) {
        setSellerStatuses((prev) => ({ ...prev, ...storedSellers }));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fail-closed RBAC helpers
  const checkPermission = useCallback(
    (permission: AdminPermission): boolean => {
      return evaluatePermission(currentUser, permission);
    },
    [currentUser]
  );

  const checkAnyPermission = useCallback(
    (permissions: AdminPermission[]): boolean => {
      return evaluateAnyPermission(currentUser, permissions);
    },
    [currentUser]
  );

  const checkAllPermissions = useCallback(
    (permissions: AdminPermission[]): boolean => {
      return evaluateAllPermissions(currentUser, permissions);
    },
    [currentUser]
  );

  // Append-only audit logger
  const logAuditEvent = useCallback(
    (
      action: string,
      targetType: AuditTargetType,
      targetId: string,
      metadata?: Record<string, unknown>,
      outcome: 'success' | 'failure' | 'denied' = 'success'
    ): void => {
      const entry: AdminAuditLogEntry = {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
        },
        action,
        targetType,
        targetId,
        metadata,
        outcome,
      };
      setAuditLogs((prev) => [entry, ...prev]);
      appendStoredAuditLog(entry);
    },
    [currentUser]
  );

  // Role & User Switching
  const setCurrentRole = useCallback(
    (role: AdminRole): void => {
      const targetUser = DEMO_ADMIN_USERS.find((u) => u.role === role) || {
        ...currentUser,
        role,
        name: `Admin (${role})`,
      };
      setCurrentUser(targetUser);
      saveStoredAdminUser(targetUser);
      logAuditEvent('ADMIN_ROLE_SWITCHED', 'settings', targetUser.id, { newRole: role });
    },
    [currentUser, logAuditEvent]
  );

  const switchUser = useCallback(
    (userId: string): void => {
      const match = DEMO_ADMIN_USERS.find((u) => u.id === userId);
      if (match) {
        setCurrentUser(match);
        saveStoredAdminUser(match);
        logAuditEvent('ADMIN_USER_SWITCHED', 'settings', match.id, { email: match.email });
      }
    },
    [logAuditEvent]
  );

  // Settings
  const updateSettings = useCallback(
    async (updated: Partial<PlatformSettings>): Promise<void> => {
      const nextSettings: PlatformSettings = {
        ...settings,
        ...updated,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name,
      };
      setSettings(nextSettings);
      saveStoredSettings(nextSettings);
      logAuditEvent(
        'PLATFORM_SETTINGS_UPDATED',
        'settings',
        'global',
        updated as Record<string, unknown>
      );
    },
    [settings, currentUser.name, logAuditEvent]
  );

  // Seller Moderation
  const moderateSeller = useCallback(
    async (
      sellerId: string,
      status: SellerStatus,
      reason?: string,
      notes?: string
    ): Promise<void> => {
      setSellerStatuses((prev) => {
        const next = { ...prev, [sellerId]: status };
        saveStoredSellerModeration(next);
        return next;
      });
      logAuditEvent(`SELLER_${status.toUpperCase()}`, 'seller', sellerId, { reason, notes });
    },
    [logAuditEvent]
  );

  // Customer Moderation
  const moderateCustomer = useCallback(
    async (customerId: string, status: CustomerAccountStatus, note?: string): Promise<void> => {
      setCustomers((prev) => {
        const next = prev.map((cust) => {
          if (cust.id === customerId) {
            return {
              ...cust,
              status,
              notes: note ? [...(cust.notes || []), note] : cust.notes,
            };
          }
          return cust;
        });
        saveStoredCustomers(next);
        return next;
      });
      logAuditEvent(`CUSTOMER_${status.toUpperCase()}`, 'customer', customerId, { note });
    },
    [logAuditEvent]
  );

  // Product Moderation
  const moderateProduct = useCallback(
    async (
      productId: string,
      status: ProductModerationStatus,
      reason?: string,
      notes?: string
    ): Promise<void> => {
      setProductStatuses((prev) => {
        const next = { ...prev, [productId]: status };
        saveStoredProductModeration(next);
        return next;
      });
      logAuditEvent(`PRODUCT_${status.toUpperCase()}`, 'product', productId, { reason, notes });
    },
    [logAuditEvent]
  );

  // Category Management
  const addCategory = useCallback(
    async (input: CategoryAdminInput): Promise<void> => {
      const newCat: Category = {
        id: `cat-${input.slug}-${Date.now().toString(36)}`,
        slug: input.slug,
        name: { en: input.name['en'] || input.slug, ...input.name },
        description: input.description
          ? { en: input.description['en'] || '', ...input.description }
          : undefined,
        parentId: input.parentId,
        level: input.parentId ? 1 : 0,
        path: `/${input.slug}`,
        childCount: 0,
        productCount: 0,
        isActive: input.isActive,
        isFeatured: input.isFeatured || false,
      };
      setCategories((prev) => [...prev, newCat]);
      logAuditEvent('CATEGORY_CREATED', 'category', newCat.id, { slug: input.slug });
    },
    [logAuditEvent]
  );

  const toggleCategoryActive = useCallback(
    async (categoryId: string): Promise<void> => {
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            const nextActive = !cat.isActive;
            logAuditEvent(
              nextActive ? 'CATEGORY_ACTIVATED' : 'CATEGORY_DEACTIVATED',
              'category',
              categoryId
            );
            return { ...cat, isActive: nextActive };
          }
          return cat;
        })
      );
    },
    [logAuditEvent]
  );

  // Order Timeline Notes
  const addOrderTimelineNote = useCallback(
    async (orderId: string, note: string): Promise<void> => {
      const event: AdminOrderTimelineEvent = {
        id: `event-${Date.now()}`,
        orderId,
        status: 'Admin Note',
        actor: currentUser.name,
        timestamp: new Date().toISOString(),
        note,
      };
      setOrderTimelineNotes((prev) => ({
        ...prev,
        [orderId]: [...(prev[orderId] || []), event],
      }));
      logAuditEvent('ORDER_NOTE_ADDED', 'order', orderId, { note });
    },
    [currentUser.name, logAuditEvent]
  );

  // Refund & Return Reviews
  const reviewRefund = useCallback(
    async (refundId: string, status: RefundStatus, adminNote?: string): Promise<void> => {
      setRefunds((prev) => {
        const next = prev.map((ref) => {
          if (ref.id === refundId) {
            return {
              ...ref,
              status,
              adminNote,
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentUser.name,
            };
          }
          return ref;
        });
        saveStoredRefunds(next);
        return next;
      });
      logAuditEvent(`REFUND_${status.toUpperCase()}`, 'refund', refundId, { adminNote });
    },
    [currentUser.name, logAuditEvent]
  );

  const reviewReturn = useCallback(
    async (returnId: string, status: ReturnStatus, adminNote?: string): Promise<void> => {
      setReturns((prev) => {
        const next = prev.map((ret) => {
          if (ret.id === returnId) {
            return {
              ...ret,
              status,
              adminNote,
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentUser.name,
            };
          }
          return ret;
        });
        saveStoredReturns(next);
        return next;
      });
      logAuditEvent(`RETURN_${status.toUpperCase()}`, 'return', returnId, { adminNote });
    },
    [currentUser.name, logAuditEvent]
  );

  // Coupons & Promotions
  const createCoupon = useCallback(
    async (input: Omit<Coupon, 'id' | 'currentUsageCount'>): Promise<void> => {
      const newCoupon: Coupon = {
        ...input,
        id: `coup-${Date.now().toString(36)}`,
        currentUsageCount: 0,
      };
      setCoupons((prev) => {
        const next = [newCoupon, ...prev];
        saveStoredCoupons(next);
        return next;
      });
      logAuditEvent('COUPON_CREATED', 'coupon', newCoupon.id, { code: newCoupon.code });
    },
    [logAuditEvent]
  );

  const toggleCouponActive = useCallback(
    async (couponId: string): Promise<void> => {
      setCoupons((prev) => {
        const next = prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c));
        saveStoredCoupons(next);
        return next;
      });
      logAuditEvent('COUPON_TOGGLED', 'coupon', couponId);
    },
    [logAuditEvent]
  );

  const createPromotion = useCallback(
    async (input: Omit<Promotion, 'id'>): Promise<void> => {
      const newPromo: Promotion = {
        ...input,
        id: `promo-${Date.now().toString(36)}`,
      };
      setPromotions((prev) => {
        const next = [newPromo, ...prev];
        saveStoredPromotions(next);
        return next;
      });
      logAuditEvent('PROMOTION_CREATED', 'coupon', newPromo.id, { name: newPromo.name });
    },
    [logAuditEvent]
  );

  // Review Moderation
  const moderateReview = useCallback(
    async (reviewId: string, status: ReviewModerationStatus, notes?: string): Promise<void> => {
      setReviews((prev) => {
        const next = prev.map((rev) => {
          if (rev.id === reviewId) {
            return {
              ...rev,
              status,
              flagReason: notes || rev.flagReason,
              moderatedAt: new Date().toISOString(),
              moderatedBy: currentUser.name,
            };
          }
          return rev;
        });
        saveStoredReviews(next);
        return next;
      });
      logAuditEvent(`REVIEW_${status.toUpperCase()}`, 'review', reviewId, { notes });
    },
    [currentUser.name, logAuditEvent]
  );

  // Notifications
  const markNotificationRead = useCallback((notificationId: string): void => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
      saveStoredNotifications(next);
      return next;
    });
  }, []);

  const clearAllNotifications = useCallback((): void => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      saveStoredNotifications(next);
      return next;
    });
  }, []);

  // Reset to Demo
  const resetAllToDemo = useCallback((): void => {
    clearAdminStorage();
    setCurrentUser(DEMO_SUPER_ADMIN);
    setSettings(DEFAULT_PLATFORM_SETTINGS);
    setCoupons(DEMO_COUPONS);
    setPromotions(DEMO_PROMOTIONS);
    setRefunds(DEMO_REFUND_REQUESTS);
    setReturns(DEMO_RETURN_REQUESTS);
    setReviews(DEMO_ADMIN_REVIEWS);
    setAuditLogs(DEMO_AUDIT_LOGS);
    setNotifications(DEMO_ADMIN_NOTIFICATIONS);
    setCustomers(loadStoredCustomers());
    setProductStatuses({});
    setSellerStatuses({
      'seller-tech-direct': 'approved',
      'seller-official-flagship': 'approved',
      'seller-global-ware': 'approved',
      'seller-nordic-audio': 'pending',
    });
  }, []);

  const value: AdminContextType = useMemo(
    () => ({
      currentUser,
      currentRole: currentUser.role,
      setCurrentRole,
      availableUsers: DEMO_ADMIN_USERS,
      switchUser,
      hasPermission: checkPermission,
      hasAnyPermission: checkAnyPermission,
      hasAllPermissions: checkAllPermissions,
      settings,
      updateSettings,
      sellerApplications,
      sellerStatuses,
      moderateSeller,
      customers,
      moderateCustomer,
      productStatuses,
      moderateProduct,
      categories,
      addCategory,
      toggleCategoryActive,
      orders,
      orderTimelineNotes,
      addOrderTimelineNote,
      refunds,
      returns,
      reviewRefund,
      reviewReturn,
      coupons,
      promotions,
      createCoupon,
      toggleCouponActive,
      createPromotion,
      reviews,
      moderateReview,
      auditLogs,
      logAuditEvent,
      notifications,
      markNotificationRead,
      clearAllNotifications,
      resetAllToDemo,
      isLoading,
    }),
    [
      currentUser,
      setCurrentRole,
      switchUser,
      checkPermission,
      checkAnyPermission,
      checkAllPermissions,
      settings,
      updateSettings,
      sellerApplications,
      sellerStatuses,
      moderateSeller,
      customers,
      moderateCustomer,
      productStatuses,
      moderateProduct,
      categories,
      addCategory,
      toggleCategoryActive,
      orders,
      orderTimelineNotes,
      addOrderTimelineNote,
      refunds,
      returns,
      reviewRefund,
      reviewReturn,
      coupons,
      promotions,
      createCoupon,
      toggleCouponActive,
      createPromotion,
      reviews,
      moderateReview,
      auditLogs,
      logAuditEvent,
      notifications,
      markNotificationRead,
      clearAllNotifications,
      resetAllToDemo,
      isLoading,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an <AdminProvider>');
  }
  return ctx;
}
