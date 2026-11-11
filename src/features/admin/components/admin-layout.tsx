'use client';

/**
 * ==============================================================================
 * ADMIN PLATFORM — SHARED LAYOUT & NAVIGATION ENGINE
 * ==============================================================================
 * Responsive administrative shell with permission-filtered sidebar navigation,
 * role switcher, notifications center, demo security disclosure, and mobile menu.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '../context/admin-context';
import type { AdminRole, AdminPermission } from '@/domains/admin';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  TicketPercent,
  Tag,
  MessageSquare,
  Settings,
  Bell,
  ScrollText,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission: AdminPermission;
  exact?: boolean;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps): React.JSX.Element {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    hasPermission,
    notifications,
    markNotificationRead,
    clearAllNotifications,
  } = useAdmin();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const navItems: NavItem[] = [
    {
      label: t('admin.dashboard') || 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      requiredPermission: 'analytics:read',
      exact: true,
    },
    {
      label: t('admin.sellers') || 'Sellers',
      href: '/admin/sellers',
      icon: Store,
      requiredPermission: 'sellers:read',
    },
    {
      label: t('admin.customers') || 'Customers',
      href: '/admin/customers',
      icon: Users,
      requiredPermission: 'customers:read',
    },
    {
      label: t('admin.products') || 'Products',
      href: '/admin/products',
      icon: Package,
      requiredPermission: 'catalog:read',
    },
    {
      label: t('admin.categories') || 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
      requiredPermission: 'catalog:read',
    },
    {
      label: t('admin.orders') || 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      requiredPermission: 'orders:read',
    },
    {
      label: t('admin.refunds') || 'Refunds',
      href: '/admin/refunds',
      icon: CreditCard,
      requiredPermission: 'refunds:read',
    },
    {
      label: t('admin.returns') || 'Returns',
      href: '/admin/returns',
      icon: RotateCcw,
      requiredPermission: 'refunds:read',
    },
    {
      label: t('admin.promotions') || 'Promotions',
      href: '/admin/promotions',
      icon: Tag,
      requiredPermission: 'promotions:read',
    },
    {
      label: t('admin.coupons') || 'Coupons',
      href: '/admin/coupons',
      icon: TicketPercent,
      requiredPermission: 'promotions:read',
    },
    {
      label: t('admin.reviews') || 'Reviews',
      href: '/admin/reviews',
      icon: MessageSquare,
      requiredPermission: 'reviews:read',
    },
    {
      label: t('admin.settings') || 'Settings',
      href: '/admin/settings',
      icon: Settings,
      requiredPermission: 'settings:read',
    },
    {
      label: t('admin.notifications') || 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      requiredPermission: 'analytics:read',
    },
    {
      label: t('admin.auditLogs') || 'Audit Logs',
      href: '/admin/audit-logs',
      icon: ScrollText,
      requiredPermission: 'audit_logs:read',
    },
    {
      label: t('admin.analytics') || 'Analytics',
      href: '/admin/analytics',
      icon: LineChart,
      requiredPermission: 'analytics:read',
    },
  ];

  // Filter items by current role permissions
  const visibleNavItems = navItems.filter((item) => hasPermission(item.requiredPermission));

  return (
    <div className="min-h-screen bg-background">
      {/* Top Demo Security Disclosure Banner */}
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Platform Administration (Demo Mode)</strong> — Role-based access control and
              administrative moderation workflows are simulated for architectural evaluation.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-muted-foreground text-[11px]">Role:</span>
            <select
              aria-label="Simulated Admin Role"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as AdminRole)}
              className="rounded border border-amber-500/40 bg-background px-2 py-0.5 text-xs font-semibold text-foreground"
            >
              <option value="super_admin">Super Admin (All Permissions)</option>
              <option value="catalog_manager">Catalog Manager</option>
              <option value="order_manager">Order & Fulfillment Manager</option>
              <option value="support_lead">Support Lead</option>
              <option value="finance_manager">Finance Manager</option>
              <option value="compliance_officer">Compliance Officer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
                A
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-foreground">
                  Nexus Admin
                </span>
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Operations
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent"
                aria-label="Admin Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-lg z-50">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="text-xs font-bold text-foreground">Notifications</span>
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 divide-y divide-border overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-muted-foreground">No alerts</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={cn(
                            'p-2.5 text-xs transition cursor-pointer hover:bg-accent/50',
                            !n.isRead && 'bg-primary/5 font-medium'
                          )}
                        >
                          <div className="text-foreground">{n.title}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border pt-1 text-center">
                    <Link
                      href="/admin/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="block py-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Current Admin User Badge */}
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className="hidden text-right text-xs md:block">
                <div className="font-semibold text-foreground">{currentUser.name}</div>
                <div className="text-[11px] text-muted-foreground capitalize">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-bold text-xs text-secondary-foreground">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Body with Sidebar */}
      <div className="mx-auto flex max-w-7xl">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border md:block">
          <nav className="sticky top-20 space-y-1 p-4">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Platform Modules
            </div>

            {visibleNavItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-6">
              <div className="rounded-xl border border-border bg-card p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Audited System</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Administrative events append immutable compliance records to the audit log.
                </p>
                <Link
                  href="/admin/audit-logs"
                  className="mt-2 block text-[11px] font-medium text-primary hover:underline"
                >
                  Review system logs →
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card p-4 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-bold text-foreground">Admin Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {visibleNavItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Admin Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h1>
              )}
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
