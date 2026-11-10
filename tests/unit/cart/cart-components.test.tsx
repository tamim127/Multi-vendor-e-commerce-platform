/**
 * ==============================================================================
 * SHOPPING CART TEST SUITE — UI COMPONENTS
 * ==============================================================================
 * Tests CartDrawer, CartPageView, multi-vendor seller grouping rendering,
 * quantity adjustments, item removal, and empty state.
 */

import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CartProvider, useCart } from '@/features/cart';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { CartPageView } from '@/features/cart/components/cart-page-view';
import { I18nProvider } from '@/lib/i18n';
import { createCartItem } from '@/domains/cart/utils/calculations';
import { createMoney } from '@/domains/catalog/utils/money';
import type { CartItem } from '@/domains/cart/types/cart';

const mockItems: CartItem[] = [
  createCartItem({
    productId: 'prod-macbook',
    slug: 'apple-macbook-pro-16',
    title: {
      en: 'MacBook Pro 16"',
      bn: 'ম্যাকবুক প্রো ১৬"',
      ar: 'ماك بوك برو ١٦',
      hi: 'मैकबुक प्रो 16',
    },
    offerId: 'ofr-mbp-official',
    sellerId: 'seller-official',
    sellerName: 'Apple Flagship Store',
    isSellerVerified: true,
    unitPrice: createMoney(249900, 'USD'),
    quantity: 1,
    maxAvailableQuantity: 10,
    shippingEstimate: { minDays: 1, maxDays: 2, isFreeShipping: true },
  }),
  createCartItem({
    productId: 'prod-sony',
    slug: 'sony-wh-1000xm5',
    title: { en: 'Sony WH-1000XM5' },
    offerId: 'ofr-sony-techdirect',
    sellerId: 'seller-techdirect',
    sellerName: 'TechDirect Official',
    isSellerVerified: true,
    unitPrice: createMoney(39900, 'USD'),
    quantity: 2,
    maxAvailableQuantity: 5,
    shippingEstimate: {
      minDays: 3,
      maxDays: 5,
      isFreeShipping: false,
      shippingCost: createMoney(1500, 'USD'),
    },
  }),
];

function TestConsumer(): React.JSX.Element {
  const { openDrawer } = useCart();
  return <button onClick={openDrawer}>Open Test Drawer</button>;
}

function renderCartWithProviders(
  ui: React.ReactElement,
  options?: { initialItems?: CartItem[] }
): ReturnType<typeof render> {
  return render(
    <I18nProvider>
      <CartProvider initialItems={options?.initialItems ?? []}>{ui}</CartProvider>
    </I18nProvider>
  );
}

describe('Shopping Cart UI Components', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('CartDrawer', () => {
    it('renders empty drawer when cart has no items', () => {
      renderCartWithProviders(
        <>
          <TestConsumer />
          <CartDrawer />
        </>
      );

      // Open drawer
      fireEvent.click(screen.getByText('Open Test Drawer'));

      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Your cart is empty')).toBeDefined();
      expect(screen.getByText('Continue Shopping')).toBeDefined();
    });

    it('renders multi-vendor seller groups and line totals when items exist', () => {
      renderCartWithProviders(
        <>
          <TestConsumer />
          <CartDrawer />
        </>,
        { initialItems: mockItems }
      );

      // Open drawer
      fireEvent.click(screen.getByText('Open Test Drawer'));

      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Apple Flagship Store')).toBeDefined();
      expect(screen.getByText('TechDirect Official')).toBeDefined();
      expect(screen.getByText('MacBook Pro 16"')).toBeDefined();
      expect(screen.getByText('Sony WH-1000XM5')).toBeDefined();

      // Check subtotal formatting ($2,499.00 + 2 * $399.00 = $3,297.00)
      expect(screen.getAllByText(/\$3,297\.00/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Proceed to Checkout')).toBeDefined();
    });
  });

  describe('CartPageView', () => {
    it('renders empty cart page with prominent CTA when cart is empty', () => {
      renderCartWithProviders(<CartPageView />);

      expect(screen.getByText('Your cart is empty')).toBeDefined();
      expect(screen.getByText('Continue Shopping')).toBeDefined();
    });

    it('renders complete multi-vendor order structure and totals', () => {
      renderCartWithProviders(<CartPageView />, { initialItems: mockItems });

      // Title & headers
      expect(screen.getByRole('heading', { level: 1, name: /Shopping Cart/i })).toBeDefined();
      expect(screen.getByText('Apple Flagship Store')).toBeDefined();
      expect(screen.getByText('TechDirect Official')).toBeDefined();

      // Line items
      expect(screen.getByText('MacBook Pro 16"')).toBeDefined();
      expect(screen.getByText('Sony WH-1000XM5')).toBeDefined();

      // Order Summary Card
      expect(screen.getByRole('heading', { level: 2, name: /Order Summary/i })).toBeDefined();
      expect(screen.getByText(/Proceed to Checkout/i)).toBeDefined();

      // Buyer protection indicators
      expect(screen.getByText(/Marketplace Buyer Protection guarantee/i)).toBeDefined();
    });

    it('allows clearing the cart completely', () => {
      renderCartWithProviders(<CartPageView />, { initialItems: mockItems });

      const clearBtn = screen.getByText('Clear Cart');
      fireEvent.click(clearBtn);

      expect(screen.getByText('Your cart is empty')).toBeDefined();
    });
  });
});
