'use client';

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
} from '@/domains/admin';

import { MOCK_CATEGORIES } from '@/domains/catalog/fixtures/categories.fixture';
import { DEMO_ORDERS } from '@/domains/customer/fixtures/orders.fixture';
import { buildApiHeaders } from '@/lib/http/csrf';

const UNAUTHENTICATED_ADMIN_USER: AdminUser = {
  id: 'unauthenticated',
  email: '',
  name: 'Unauthenticated Visitor',
  role: 'support_lead',
  permissions: [],
  isActive: false,
  lastLoginAt: '',
  createdAt: '',
};

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
  refreshAdminData: () => Promise<void>;
  isLoading: boolean;
  adminError: string | null;
  isPermissionDenied: boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const isTestEnv = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test';

  const [currentUser, setCurrentUser] = useState<AdminUser>(
    isTestEnv ? DEMO_SUPER_ADMIN : UNAUTHENTICATED_ADMIN_USER
  );
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [coupons, setCoupons] = useState<Coupon[]>(isTestEnv ? DEMO_COUPONS : []);
  const [promotions, setPromotions] = useState<Promotion[]>(isTestEnv ? DEMO_PROMOTIONS : []);
  const [refunds, setRefunds] = useState<RefundRequest[]>(isTestEnv ? DEMO_REFUND_REQUESTS : []);
  const [returns, setReturns] = useState<ReturnRequest[]>(isTestEnv ? DEMO_RETURN_REQUESTS : []);
  const [reviews, setReviews] = useState<AdminProductReview[]>(isTestEnv ? DEMO_ADMIN_REVIEWS : []);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>(isTestEnv ? DEMO_AUDIT_LOGS : []);
  const [notifications, setNotifications] = useState<AdminNotification[]>(
    isTestEnv ? DEMO_ADMIN_NOTIFICATIONS : []
  );
  const [customers, setCustomers] = useState<CustomerAdminSummary[]>([]);
  const [productStatuses, setProductStatuses] = useState<Record<string, ProductModerationStatus>>({});
  const [sellerStatuses, setSellerStatuses] = useState<Record<string, SellerStatus>>({});
  const [sellerApplications] = useState<SellerApplicationRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>(isTestEnv ? MOCK_CATEGORIES : []);
  const [orders, setOrders] = useState<CustomerOrder[]>(isTestEnv ? DEMO_ORDERS : []);
  const [orderTimelineNotes, setOrderTimelineNotes] = useState<
    Record<string, AdminOrderTimelineEvent[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(!isTestEnv);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);

  const refreshAdminData = useCallback(async () => {
    if (isTestEnv) return;
    setIsLoading(true);
    setAdminError(null);
    setIsPermissionDenied(false);

    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      const meJson = await meRes.json().catch(() => null);
      const authCustomer = meJson?.data?.customer;

      if (!meRes.ok || !meJson?.data?.isAuthenticated || authCustomer?.role !== 'admin') {
        setCurrentUser(UNAUTHENTICATED_ADMIN_USER);
        setIsPermissionDenied(true);
        setAdminError('Authenticated administrative credentials are required.');
        setIsLoading(false);
        return;
      }

      setCurrentUser({
        id: authCustomer.id,
        email: authCustomer.email,
        name: `${authCustomer.firstName} ${authCustomer.lastName}`,
        role: authCustomer.adminRole || 'super_admin',
        permissions: authCustomer.adminPermissions || [],
        isActive: authCustomer.status === 'active',
        lastLoginAt: authCustomer.updatedAt,
        createdAt: authCustomer.createdAt,
      });

      const [
        sellersRes,
        custRes,
        prodRes,
        catRes,
        ordRes,
        cpnRes,
        prmRes,
        refRes,
        retRes,
        revRes,
        audRes,
        notRes,
        setRes,
      ] = await Promise.all([
        fetch('/api/admin/sellers', { credentials: 'include' }),
        fetch('/api/admin/customers', { credentials: 'include' }),
        fetch('/api/admin/products', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
        fetch('/api/admin/orders', { credentials: 'include' }),
        fetch('/api/admin/coupons', { credentials: 'include' }),
        fetch('/api/admin/promotions', { credentials: 'include' }),
        fetch('/api/admin/refunds', { credentials: 'include' }),
        fetch('/api/admin/returns', { credentials: 'include' }),
        fetch('/api/admin/reviews', { credentials: 'include' }),
        fetch('/api/admin/audit-logs', { credentials: 'include' }),
        fetch('/api/admin/notifications', { credentials: 'include' }),
        fetch('/api/admin/settings', { credentials: 'include' }),
      ]);

      if (sellersRes.ok) {
        const sj = await sellersRes.json();
        const statusMap: Record<string, SellerStatus> = {};
        for (const s of sj.data || []) statusMap[s.id] = s.status;
        setSellerStatuses(statusMap);
      }
      if (custRes.ok) {
        const cj = await custRes.json();
        setCustomers(cj.data || []);
      }
      if (prodRes.ok) {
        const pj = await prodRes.json();
        const pmMap: Record<string, ProductModerationStatus> = {};
        for (const p of pj.data || []) pmMap[p.id] = p.moderation_status || 'approved';
        setProductStatuses(pmMap);
      }
      if (catRes.ok) {
        const ctj = await catRes.json();
        setCategories(
          (ctj.data || []).map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: { en: c.name_en },
            parentId: c.parent_id,
            level: c.level,
            path: `/${c.slug}`,
            childCount: 0,
            productCount: 0,
            isActive: Boolean(c.is_active),
            isFeatured: false,
          }))
        );
      }
      if (ordRes.ok) {
        const oj = await ordRes.json();
        setOrders(oj.data || []);
      }
      if (cpnRes.ok) setCoupons((await cpnRes.json()).data || []);
      if (prmRes.ok) setPromotions((await prmRes.json()).data || []);
      if (refRes.ok) setRefunds((await refRes.json()).data || []);
      if (retRes.ok) setReturns((await retRes.json()).data || []);
      if (revRes.ok) setReviews((await revRes.json()).data || []);
      if (audRes.ok) setAuditLogs((await audRes.json()).data || []);
      if (notRes.ok) setNotifications((await notRes.json()).data || []);
      if (setRes.ok) {
        const s = (await setRes.json()).data;
        if (s) {
          setSettings((prev) => ({
            ...prev,
            marketplaceName: s.marketplace_name,
            supportEmail: s.support_email,
            maintenanceMode: Boolean(s.maintenance_mode),
            updatedAt: s.updated_at || prev.updatedAt,
          }));
        }
      }
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Unable to reach admin backend API.');
    } finally {
      setIsLoading(false);
    }
  }, [isTestEnv]);

  useEffect(() => {
    void refreshAdminData();
  }, [refreshAdminData]);

  const checkPermission = useCallback(
    (permission: AdminPermission): boolean => evaluatePermission(currentUser, permission),
    [currentUser]
  );

  const checkAnyPermission = useCallback(
    (permissions: AdminPermission[]): boolean => evaluateAnyPermission(currentUser, permissions),
    [currentUser]
  );

  const checkAllPermissions = useCallback(
    (permissions: AdminPermission[]): boolean => evaluateAllPermissions(currentUser, permissions),
    [currentUser]
  );

  const logAuditEvent = useCallback(
    (
      _action: string,
      _targetType: AuditTargetType,
      _targetId: string,
      _metadata?: Record<string, unknown>,
      _outcome?: 'success' | 'failure' | 'denied'
    ) => {
      // Server writes authoritative audit logs on every admin API mutation
    },
    []
  );

  const setCurrentRole = useCallback((_role: AdminRole) => {
    setAdminError('Client-side role switching is disabled; server session enforces RBAC role.');
  }, []);

  const switchUser = useCallback((_userId: string) => {
    setAdminError('Client-side user switching is disabled; sign in with target credentials.');
  }, []);

  const mutateAdminApi = useCallback(
    async (url: string, method: string, payload: unknown) => {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        const msg = json?.error || `Admin action rejected (HTTP ${res.status})`;
        setAdminError(msg);
        throw new Error(msg);
      }
      await refreshAdminData();
      return json.data;
    },
    [refreshAdminData]
  );

  const updateSettings = useCallback(
    async (updated: Partial<PlatformSettings>) => {
      await mutateAdminApi('/api/admin/settings', 'PATCH', updated);
    },
    [mutateAdminApi]
  );

  const moderateSeller = useCallback(
    async (sellerId: string, status: SellerStatus, reason?: string) => {
      await mutateAdminApi('/api/admin/sellers', 'PATCH', {
        sellerId,
        status: status === 'pending' ? 'pending_review' : status,
        reason,
      });
    },
    [mutateAdminApi]
  );

  const moderateCustomer = useCallback(
    async (customerId: string, status: CustomerAccountStatus, note?: string) => {
      await mutateAdminApi('/api/admin/customers', 'PATCH', { customerId, status, note });
    },
    [mutateAdminApi]
  );

  const moderateProduct = useCallback(
    async (productId: string, status: ProductModerationStatus, reason?: string) => {
      await mutateAdminApi('/api/admin/products', 'PATCH', {
        productId,
        moderationStatus: status,
        reason,
      });
    },
    [mutateAdminApi]
  );

  const addCategory = useCallback(
    async (input: CategoryAdminInput) => {
      await mutateAdminApi('/api/admin/categories', 'POST', {
        mode: 'create',
        nameEn: input.name['en'] || input.slug,
        slug: input.slug,
        parentId: input.parentId,
      });
    },
    [mutateAdminApi]
  );

  const toggleCategoryActive = useCallback(
    async (categoryId: string) => {
      await mutateAdminApi('/api/admin/categories', 'POST', { mode: 'toggle', categoryId });
    },
    [mutateAdminApi]
  );

  const addOrderTimelineNote = useCallback(
    async (orderId: string, note: string) => {
      await mutateAdminApi('/api/admin/orders', 'PATCH', { action: 'add_note', orderId, note });
      setOrderTimelineNotes((prev) => ({
        ...prev,
        [orderId]: [
          ...(prev[orderId] || []),
          {
            id: `note-${Date.now()}`,
            orderId,
            status: 'Admin Note',
            actor: currentUser.name,
            timestamp: new Date().toISOString(),
            note,
          },
        ],
      }));
    },
    [mutateAdminApi, currentUser.name]
  );

  const reviewRefund = useCallback(
    async (refundId: string, status: RefundStatus, adminNote?: string) => {
      await mutateAdminApi('/api/admin/refunds', 'PATCH', { refundId, status, adminNote });
    },
    [mutateAdminApi]
  );

  const reviewReturn = useCallback(
    async (returnId: string, status: ReturnStatus, adminNote?: string) => {
      await mutateAdminApi('/api/admin/returns', 'PATCH', { returnId, status, adminNote });
    },
    [mutateAdminApi]
  );

  const createCoupon = useCallback(
    async (input: Omit<Coupon, 'id' | 'currentUsageCount'>) => {
      await mutateAdminApi('/api/admin/coupons', 'POST', { mode: 'create', ...input });
    },
    [mutateAdminApi]
  );

  const toggleCouponActive = useCallback(
    async (couponId: string) => {
      await mutateAdminApi('/api/admin/coupons', 'POST', { mode: 'toggle', couponId });
    },
    [mutateAdminApi]
  );

  const createPromotion = useCallback(
    async (input: Omit<Promotion, 'id'>) => {
      await mutateAdminApi('/api/admin/promotions', 'POST', input);
    },
    [mutateAdminApi]
  );

  const moderateReview = useCallback(
    async (reviewId: string, status: ReviewModerationStatus) => {
      await mutateAdminApi('/api/admin/reviews', 'PATCH', { reviewId, status });
    },
    [mutateAdminApi]
  );

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      void mutateAdminApi('/api/admin/notifications', 'PATCH', { notificationId }).catch(() => {});
    },
    [mutateAdminApi]
  );

  const clearAllNotifications = useCallback(() => {
    void mutateAdminApi('/api/admin/notifications', 'PATCH', { clearAll: true }).catch(() => {});
  }, [mutateAdminApi]);

  const resetAllToDemo = useCallback(() => {
    void refreshAdminData();
  }, [refreshAdminData]);

  const value: AdminContextType = useMemo(
    () => ({
      currentUser,
      currentRole: currentUser.role,
      setCurrentRole,
      availableUsers: isTestEnv ? DEMO_ADMIN_USERS : [currentUser],
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
      refreshAdminData,
      isLoading,
      adminError,
      isPermissionDenied,
    }),
    [
      currentUser,
      isTestEnv,
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
      refreshAdminData,
      isLoading,
      adminError,
      isPermissionDenied,
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
