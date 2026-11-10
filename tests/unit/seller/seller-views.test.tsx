/**
 * ==============================================================================
 * SELLER DOMAIN — VIEWS & COMPONENTS UNIT TESTS
 * ==============================================================================
 */

import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import { SellerProvider } from '@/features/seller/context/seller-context';
import {
  SellerDashboardView,
  SellerStoreView,
  SellerInventoryView,
  SellerOrdersView,
} from '@/features/seller';

function renderWithSellerProviders(ui: React.ReactElement) {
  return render(
    <I18nProvider defaultLocale="en">
      <SellerProvider>{ui}</SellerProvider>
    </I18nProvider>
  );
}

describe('Seller Platform — Dashboard View', () => {
  it('renders revenue counter and daily trends heading', () => {
    renderWithSellerProviders(<SellerDashboardView />);
    expect(screen.getByText(/Total Revenue/i)).toBeDefined();
    expect(screen.getByText(/Sales & Revenue Trends/i)).toBeDefined();
  });
});

describe('Seller Platform — Store Settings View', () => {
  it('renders store details, support email, and policy inputs', () => {
    renderWithSellerProviders(<SellerStoreView />);
    expect(screen.getByText(/Storefront Branding & Identity/i)).toBeDefined();
    expect(screen.getByLabelText(/Customer Support Email \*/i)).toBeDefined();
  });
});

describe('Seller Platform — Inventory Matrix View', () => {
  it('renders inventory filter buttons and SKU matrix table', () => {
    renderWithSellerProviders(<SellerInventoryView />);
    expect(screen.getByPlaceholderText(/Search inventory by product title or SKU/i)).toBeDefined();
    expect(screen.getByText(/All SKUs/i)).toBeDefined();
  });
});

describe('Seller Platform — Orders Management View', () => {
  it('renders order filter tabs and packages list', () => {
    renderWithSellerProviders(<SellerOrdersView />);
    expect(
      screen.getByPlaceholderText(/Search by Package ID, Order ID, or Customer Name/i)
    ).toBeDefined();
    expect(screen.getByText(/Package & Order/i)).toBeDefined();
  });
});
