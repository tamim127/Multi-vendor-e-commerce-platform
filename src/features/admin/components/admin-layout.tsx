'use client';

/**
 * ==============================================================================
 * AUREON ADMIN PLATFORM — SHARED LAYOUT & NAVIGATION ENGINE
 * ==============================================================================
 * Ultra-premium administrative shell matching the Aureon dashboard design:
 * - Dual Light & Dark theme support with instant Sun/Moon switcher
 * - Categorized sidebar navigation (Marketplace Operations, Platform Management, System & Settings)
 * - Badged route counts, active warm gold pill highlight, and Marketplace AI card
 * - Header with universal search, notifications center, role switcher, and admin profile
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '../context/admin-context';
import type { AdminRole, AdminPermission } from '@/domains/admin';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/lib/theme/theme-context';
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
  Sparkles,
  Search,
  Sun,
  Moon,
  ChevronDown,
  LifeBuoy,
  Globe,
  Sliders,
  DollarSign,
  Layers,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission: AdminPermission;
  badge?: number | string;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
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
  const { resolvedTheme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const navGroups: NavGroup[] = [
    {
      title: 'MARKETPLACE OPERATIONS',
      items: [
        {
          label: t('admin.sellers') || 'Sellers',
          href: '/admin/sellers',
          icon: Store,
          requiredPermission: 'sellers:read',
          badge: 12,
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
          label: t('admin.orders') || 'Orders',
          href: '/admin/orders',
          icon: ShoppingBag,
          requiredPermission: 'orders:read',
          badge: 24,
        },
        {
          label: t('admin.refunds') || 'Refunds',
          href: '/admin/refunds',
          icon: CreditCard,
          requiredPermission: 'refunds:read',
          badge: 5,
        },
        {
          label: t('admin.returns') || 'Returns',
          href: '/admin/returns',
          icon: RotateCcw,
          requiredPermission: 'refunds:read',
          badge: 3,
        },
        {
          label: t('admin.categories') || 'Categories',
          href: '/admin/categories',
          icon: FolderTree,
          requiredPermission: 'catalog:read',
        },
        {
          label: 'Brands',
          href: '/admin/categories',
          icon: Layers,
          requiredPermission: 'catalog:read',
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
          label: t('admin.reviews') || 'Reviews & Ratings',
          href: '/admin/reviews',
          icon: MessageSquare,
          requiredPermission: 'reviews:read',
        },
      ],
    },
    {
      title: 'PLATFORM MANAGEMENT',
      items: [
        {
          label: t('admin.analytics') || 'Analytics',
          href: '/admin/analytics',
          icon: LineChart,
          requiredPermission: 'analytics:read',
        },
        {
          label: 'Finance & Payouts',
          href: '/admin/analytics',
          icon: DollarSign,
          requiredPermission: 'analytics:read',
        },
        {
          label: 'Support Tickets',
          href: '/admin/notifications',
          icon: LifeBuoy,
          requiredPermission: 'analytics:read',
          badge: 8,
        },
        {
          label: t('admin.notifications') || 'Notifications',
          href: '/admin/notifications',
          icon: Bell,
          requiredPermission: 'analytics:read',
        },
        {
          label: 'Content Management',
          href: '/admin/settings',
          icon: Sliders,
          requiredPermission: 'settings:read',
        },
      ],
    },
    {
      title: 'SYSTEM & SETTINGS',
      items: [
        {
          label: t('admin.settings') || 'Settings',
          href: '/admin/settings',
          icon: Settings,
          requiredPermission: 'settings:read',
        },
        {
          label: 'Security & Access',
          href: '/admin/settings',
          icon: ShieldCheck,
          requiredPermission: 'settings:read',
        },
        {
          label: t('admin.auditLogs') || 'Audit Logs',
          href: '/admin/audit-logs',
          icon: ScrollText,
          requiredPermission: 'audit_logs:read',
        },
        {
          label: t('admin.aiCopilot') || 'AI Assistant',
          href: '/admin/ai',
          icon: Sparkles,
          requiredPermission: 'analytics:read',
        },
      ],
    },
  ];

  const isDashboardActive = pathname === '/admin';

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0B0C] text-slate-900 dark:text-white transition-colors duration-200">
      {/* 1. Top Simulated Role & Security Disclosure Banner */}
      <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate">
              <strong>Platform Administration (Demo Mode)</strong> — Role-based access control and
              administrative moderation workflows.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400 text-[11px]">
              Simulate Role:
            </span>
            <select
              aria-label="Simulated Admin Role"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as AdminRole)}
              className="rounded-lg border border-amber-500/30 bg-white dark:bg-[#18181B] px-2 py-0.5 text-xs font-bold text-slate-900 dark:text-amber-300 focus:outline-none"
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

      {/* 2. Main Executive Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-[#1F1F24] bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#18181B] md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-lg shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                ▲
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  Aureon
                </span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-500 dark:text-amber-400 leading-none mt-1">
                  MARKETPLACE
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Universal Search Input */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full flex items-center rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-3.5 py-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
              <Search className="h-4 w-4 text-slate-400 dark:text-[#71717A] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything... (orders, products, users, sellers, etc.)"
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#71717A] focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 dark:border-[#3F3F46] bg-white dark:bg-[#27272A] px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-[#A1A1AA]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Notifications, Theme Switcher, Language & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative rounded-xl p-2 text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#18181B] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Admin Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#141416] p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-2 mb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      Notifications ({unreadNotifCount})
                    </span>
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="text-[11px] font-semibold text-amber-500 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-slate-400">No new notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={cn(
                            'p-2.5 rounded-xl border transition-colors cursor-pointer',
                            n.isRead
                              ? 'border-transparent text-slate-500 dark:text-[#A1A1AA]'
                              : 'border-amber-400/30 bg-amber-400/5 text-slate-900 dark:text-white'
                          )}
                        >
                          <div className="font-bold">{n.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-[#9CA3AF] mt-0.5 line-clamp-2">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Toggle theme. Current theme: ${resolvedTheme}`}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] text-slate-700 dark:text-amber-400 hover:border-amber-400 transition-colors cursor-pointer"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>

            {/* Language Dropdown Selector */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#D1D5DB] bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] px-3 py-1.5 rounded-xl cursor-pointer hover:border-amber-400">
              <Globe className="h-3.5 w-3.5 text-amber-500" />
              <span>English</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </div>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2.5 pl-1 sm:pl-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm shadow-sm">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {currentUser?.name || 'Admin'}
                </span>
                <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Split Content: Fixed Sidebar + Scrollable View */}
      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-200 dark:border-[#1F1F24] bg-white dark:bg-[#0B0B0C] p-4 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            {/* Primary Dashboard Link */}
            <div>
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all',
                  isDashboardActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#18181B] hover:text-slate-950 dark:hover:text-white'
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Categorized Nav Groups */}
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((item) =>
                hasPermission(item.requiredPermission)
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1">
                  <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-[#71717A] mb-2">
                    {group.title}
                  </div>
                  {visibleItems.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href) && !isDashboardActive;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-amber-400/15 text-amber-600 dark:text-amber-300 border border-amber-400/30 font-bold'
                            : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#18181B] hover:text-slate-950 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className="rounded-full bg-slate-200 dark:bg-[#27272A] px-2 py-0.5 text-[10px] font-black text-slate-700 dark:text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Bottom Sidebar Feature: Marketplace AI Card */}
          <div className="pt-6">
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-bold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Marketplace AI</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                Get insights, automate tasks, and make better decisions.
              </p>
              <Link
                href="/admin/ai"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-2 shadow-xs transition-colors"
              >
                <span>Open AI Assistant</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Administrative Views Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto w-full">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
