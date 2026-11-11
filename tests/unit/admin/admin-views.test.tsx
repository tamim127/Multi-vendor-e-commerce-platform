/**
 * ==============================================================================
 * ADMIN PLATFORM — VIEWS & COMPONENTS UNIT TESTS
 * ==============================================================================
 */

import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import { AdminProvider } from '@/features/admin/context/admin-context';
import {
  AdminDashboardView,
  AdminSellersView,
  AdminCustomersView,
  AdminProductsView,
  AdminCouponsView,
  AdminSettingsView,
  AdminGuard,
} from '@/features/admin';

function renderWithAdminProviders(ui: React.ReactElement) {
  return render(
    <I18nProvider defaultLocale="en">
      <AdminProvider>{ui}</AdminProvider>
    </I18nProvider>
  );
}

describe('Admin Platform — Dashboard View', () => {
  it('renders GMV counter and recent audit log events', () => {
    renderWithAdminProviders(<AdminDashboardView />);
    expect(screen.getByText(/Platform Gross Merchandise/i)).toBeDefined();
    expect(screen.getByText(/Recent Audit Log Events/i)).toBeDefined();
    expect(screen.getByText(/Administrative Shortcuts/i)).toBeDefined();
  });
});

describe('Admin Platform — Sellers View', () => {
  it('renders merchant search and table headings', () => {
    renderWithAdminProviders(<AdminSellersView />);
    expect(screen.getByPlaceholderText(/Search sellers by store/i)).toBeDefined();
    expect(screen.getByText(/Merchant \/ Store/i)).toBeDefined();
  });
});

describe('Admin Platform — Customers View', () => {
  it('renders customer accounts directory and search input', () => {
    renderWithAdminProviders(<AdminCustomersView />);
    expect(screen.getByPlaceholderText(/Search customers by name or email/i)).toBeDefined();
    expect(screen.getByText(/Customer Identity/i)).toBeDefined();
  });
});

describe('Admin Platform — Products View', () => {
  it('renders catalog products moderation table', () => {
    renderWithAdminProviders(<AdminProductsView />);
    expect(screen.getByPlaceholderText(/Search canonical catalog products/i)).toBeDefined();
    expect(screen.getByText(/Canonical Product/i)).toBeDefined();
  });
});

describe('Admin Platform — Coupons View', () => {
  it('renders coupon list and create action', () => {
    renderWithAdminProviders(<AdminCouponsView />);
    expect(screen.getByText(/Discount Coupons/i)).toBeDefined();
    expect(screen.getByText(/Create Coupon/i)).toBeDefined();
  });
});

describe('Admin Platform — Settings View', () => {
  it('renders marketplace take-rate and onboarding settings', () => {
    renderWithAdminProviders(<AdminSettingsView />);
    expect(screen.getByText(/Marketplace Identity/i)).toBeDefined();
    expect(screen.getByText(/Financial & Take-Rate Policies/i)).toBeDefined();
  });
});

describe('Admin Platform — AdminGuard Access Control', () => {
  it('renders children when super admin has required permission', () => {
    renderWithAdminProviders(
      <AdminGuard requiredPermission="sellers:read">
        <div data-testid="authorized-content">Super Admin Access Granted</div>
      </AdminGuard>
    );
    expect(screen.getByTestId('authorized-content')).toBeDefined();
  });
});
