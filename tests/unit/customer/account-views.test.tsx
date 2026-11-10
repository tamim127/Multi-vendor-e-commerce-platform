/**
 * ==============================================================================
 * CUSTOMER DOMAIN — ACCOUNT VIEWS UNIT TESTS
 * ==============================================================================
 */

import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/features/auth';
import { WishlistProvider } from '@/features/wishlist';
import { RecentlyViewedProvider } from '@/features/recently-viewed';
import { DEMO_CUSTOMER } from '@/domains/customer/fixtures/customer.fixture';
import {
  AccountDashboardView,
  ProfilePageView,
  AddressesPageView,
  OrdersPageView,
  SettingsPageView,
} from '@/features/account';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <I18nProvider defaultLocale="en">
      <AuthProvider initialCustomer={DEMO_CUSTOMER}>
        <WishlistProvider>
          <RecentlyViewedProvider>{ui}</RecentlyViewedProvider>
        </WishlistProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

describe('Account Feature — Dashboard View', () => {
  it('renders customer greeting and stat counters', () => {
    renderWithProviders(<AccountDashboardView />);
    expect(screen.getByRole('heading', { level: 2, name: /Welcome back/i })).toBeDefined();
    expect(screen.getByText('sarah.jenkins@example.com')).toBeDefined();
  });
});

describe('Account Feature — Profile View', () => {
  it('renders prefilled customer profile fields and email verification badge', () => {
    renderWithProviders(<ProfilePageView />);
    const firstNameInput = screen.getByDisplayValue('Sarah') as HTMLInputElement;
    expect(firstNameInput).toBeDefined();

    const lastNameInput = screen.getByDisplayValue('Jenkins') as HTMLInputElement;
    expect(lastNameInput).toBeDefined();

    expect(screen.getAllByText(/Verified/i).length).toBeGreaterThan(0);
  });
});

describe('Account Feature — Addresses View', () => {
  it('renders default shipping and billing address badges', () => {
    renderWithProviders(<AddressesPageView />);
    expect(screen.getByText(/742 Evergreen Terrace/i)).toBeDefined();
    expect(screen.getAllByText(/Default Shipping/i).length).toBeGreaterThan(0);
  });
});

describe('Account Feature — Orders View', () => {
  it('renders demo customer order history cards with order IDs', () => {
    renderWithProviders(<OrdersPageView />);
    expect(screen.getByText(/ORD-2026-981245/i)).toBeDefined();
  });
});

describe('Account Feature — Settings View', () => {
  it('renders notification toggles and security section', () => {
    renderWithProviders(<SettingsPageView />);
    expect(screen.getByText(/Order status updates via email/i)).toBeDefined();
    expect(screen.getByText(/Two-Factor Authentication/i)).toBeDefined();
  });
});
