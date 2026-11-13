'use client';

/**
 * ==============================================================================
 * SELLER PLATFORM — SHARED LAYOUT & NAVIGATION ENGINE
 * ==============================================================================
 * Responsive seller portal shell with sidebar navigation, store overview badge,
 * mobile drawer, and storefront preview shortcut.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSeller } from '../context/seller-context';
import { SellerGuard } from './seller-guard';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/lib/theme/theme-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  BarChart3,
  Store,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { Container } from '@/components/layout/container/container';
import { Button } from '@/components/ui/button/button';

export interface SellerLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function SellerLayout({ children, title, subtitle }: SellerLayoutProps): React.JSX.Element {
  const { sellerProfile, isApproved, resetToDemo } = useSeller();
  const { t } = useTranslation();
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: t('seller.dashboard') || 'Dashboard',
      href: '/seller',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: t('seller.products') || 'Products',
      href: '/seller/products',
      icon: Package,
      exact: false,
    },
    {
      label: t('seller.inventory') || 'Inventory',
      href: '/seller/inventory',
      icon: Boxes,
      exact: false,
    },
    {
      label: t('seller.orders') || 'Orders',
      href: '/seller/orders',
      icon: Truck,
      exact: false,
    },
    {
      label: t('seller.analytics') || 'Analytics',
      href: '/seller/analytics',
      icon: BarChart3,
      exact: false,
    },
    {
      label: t('seller.aiStudio') || 'AI Assistant',
      href: '/seller/ai',
      icon: Sparkles,
      exact: false,
    },
    {
      label: t('seller.storeSettings') || 'Store Settings',
      href: '/seller/store',
      icon: Store,
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean): boolean => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const storeSlug = sellerProfile?.slug || 'tech-direct-express';

  return (
    <SellerGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0B0C] text-slate-900 dark:text-white transition-colors duration-200">
        {/* Merchant Executive Header Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-[#1F1F24] bg-white/95 dark:bg-[#0B0B0C]/95 backdrop-blur-md">
          <Container className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#18181B] md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Seller Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-base shadow-sm">
                  {sellerProfile?.name ? sellerProfile.name.charAt(0) : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                      {sellerProfile?.name || 'Seller Central'}
                    </span>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold">
                        <ShieldCheck className="h-3 w-3" />
                        {t('seller.approved')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {sellerProfile?.tagline || 'Marketplace Verified Merchant'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Theme Switcher */}
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

              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDemo}
                title="Reset seller data to demo fixtures"
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl"
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset Demo</span>
              </Button>

              <Link
                href={`/store/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-amber-400 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-amber-500" />
                <span>{t('seller.storefrontPreview')}</span>
              </Link>
            </div>
          </Container>
        </header>

        {/* Main Content Layout */}
        <Container className="py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Desktop Navigation Sidebar */}
            <aside className="hidden md:block md:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-3 shadow-xs space-y-4">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('seller.title') || 'SELLER MENU'}
                </div>
                <nav className="space-y-1" aria-label="Seller Portal Navigation">
                  {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all',
                          active
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-xs shadow-amber-400/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18181B] hover:text-slate-950 dark:hover:text-white'
                        )}
                      >
                        <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-slate-950' : 'text-slate-400')} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* AI Helper Banner */}
                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Seller Copilot</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    AI suggestions for inventory reordering and pricing optimizations.
                  </p>
                  <Link
                    href="/seller/ai"
                    className="block text-center rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] py-1.5 transition-colors"
                  >
                    Open Copilot
                  </Link>
                </div>
              </div>
            </aside>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden col-span-1 rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121215] p-4 shadow-sm mb-4">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors',
                          active
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18181B]'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Main Area */}
            <main className="md:col-span-3 lg:col-span-4 space-y-6">
              {(title || subtitle) && (
                <div className="border-b border-slate-200 dark:border-[#1F1F24] pb-4">
                  {title && (
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      {title}
                    </h1>
                  )}
                  {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                </div>
              )}
              {children}
            </main>
          </div>
        </Container>
      </div>
    </SellerGuard>
  );
}
