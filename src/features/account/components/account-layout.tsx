/**
 * ==============================================================================
 * ACCOUNT FEATURE — SHARED ACCOUNT LAYOUT & SIDEBAR NAVIGATION
 * ==============================================================================
 * Responsive account wrapper with sidebar navigation and mobile tab strip.
 * Protected by AuthGuard.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, AuthGuard } from '@/features/auth';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Container } from '@/components/layout/container/container';

export interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AccountLayout({
  children,
  title,
  subtitle,
}: AccountLayoutProps): React.JSX.Element {
  const { customer, logout } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();

  const navItems = [
    {
      label: t('account.dashboard'),
      href: '/account',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: t('account.orders'),
      href: '/account/orders',
      icon: Package,
      exact: false,
    },
    {
      label: t('account.wishlist'),
      href: '/account/wishlist',
      icon: Heart,
      exact: false,
    },
    {
      label: t('account.addresses'),
      href: '/account/addresses',
      icon: MapPin,
      exact: false,
    },
    {
      label: t('account.profile'),
      href: '/account/profile',
      icon: User,
      exact: false,
    },
    {
      label: t('account.settings'),
      href: '/account/settings',
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <AuthGuard>
      <div className="py-8 bg-surface-subtle/40 min-h-[calc(100vh-200px)]">
        <Container size="standard">
          {/* Header Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
                {title || t('account.title')}
              </h1>
              {subtitle && <p className="text-sm text-fg-muted mt-1 leading-relaxed">{subtitle}</p>}
            </div>
            {customer && (
              <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-surface border border-border-default px-3 py-1.5 shadow-2xs">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                  {customer.firstName.charAt(0)}
                  {customer.lastName.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-fg-primary truncate max-w-40">
                  {customer.firstName} {customer.lastName}
                </span>
                {customer.emailVerified && (
                  <ShieldCheck
                    className="size-3.5 text-success shrink-0"
                    aria-label="Verified Customer"
                  />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop / Tablet Sidebar Navigation (3 cols) */}
            <aside className="lg:col-span-3">
              <nav
                aria-label="Account navigation"
                className="rounded-2xl border border-border-default bg-surface p-2 shadow-xs space-y-1"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                          : 'text-fg-muted hover:bg-surface-muted hover:text-fg-primary'
                      )}
                    >
                      <Icon className="size-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="border-t border-border-subtle pt-1 my-1">
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-4.5 shrink-0 rtl:rotate-180" />
                    <span>{t('auth.logout')}</span>
                  </button>
                </div>
              </nav>
            </aside>

            {/* Main Account View Outlet (9 cols) */}
            <main className="lg:col-span-9">{children}</main>
          </div>
        </Container>
      </div>
    </AuthGuard>
  );
}
