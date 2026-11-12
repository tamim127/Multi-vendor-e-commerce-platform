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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: t('seller.dashboard'),
      href: '/seller',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: t('seller.products'),
      href: '/seller/products',
      icon: Package,
      exact: false,
    },
    {
      label: t('seller.inventory'),
      href: '/seller/inventory',
      icon: Boxes,
      exact: false,
    },
    {
      label: t('seller.orders'),
      href: '/seller/orders',
      icon: Truck,
      exact: false,
    },
    {
      label: t('seller.analytics'),
      href: '/seller/analytics',
      icon: BarChart3,
      exact: false,
    },
    {
      label: t('seller.aiStudio') || 'AI Studio',
      href: '/seller/ai',
      icon: Sparkles,
      exact: false,
    },
    {
      label: t('seller.storeSettings'),
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
      <div className="min-h-screen bg-[#F6F8FB]">
        {/* Merchant Subheader Bar */}
        <div className="border-b border-slate-200/80 bg-white shadow-2xs">
          <Container className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Seller Menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-base shadow-xs">
                  {sellerProfile?.name ? sellerProfile.name.charAt(0) : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {sellerProfile?.name || 'Seller Central'}
                    </span>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                        <ShieldCheck className="h-3 w-3" />
                        {t('seller.approved')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    {sellerProfile?.tagline || 'Marketplace Verified Merchant'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDemo}
                title="Reset seller data to demo fixtures"
                className="text-xs text-slate-500 hover:text-slate-800 rounded-full"
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset Demo</span>
              </Button>

              <Button
                variant="tertiary"
                size="sm"
                asChild
                className="text-xs font-semibold rounded-full border-slate-200"
              >
                <Link href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  {t('seller.storefrontPreview')}
                </Link>
              </Button>
            </div>
          </Container>
        </div>

        {/* Main Content Layout */}
        <Container className="py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Desktop Navigation Sidebar */}
            <aside className="hidden md:block md:col-span-1">
              <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('seller.title')}
                </div>
                <nav className="mt-2 space-y-1.5" aria-label="Seller Portal Navigation">
                  {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150',
                          active
                            ? 'bg-slate-100 text-slate-900 shadow-2xs font-extrabold'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden col-span-1 rounded-2xl border border-border bg-card p-4 shadow-sm mb-4">
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
                          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                <div className="border-b border-border/60 pb-4">
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
        </Container>
      </div>
    </SellerGuard>
  );
}
