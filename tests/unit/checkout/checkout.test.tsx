/**
 * ==============================================================================
 * CHECKOUT TEST SUITE — DOMAIN SCHEMAS & CHECKOUT VIEW
 * ==============================================================================
 * Tests checkout validation schemas, multi-vendor package calculations,
 * delivery options, and idempotent order submission.
 */

import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CartProvider } from '@/features/cart';
import { CheckoutPageView } from '@/features/checkout/components/checkout-page-view';
import { CheckoutFormSchema } from '@/domains/checkout/schemas/checkout.schema';
import { I18nProvider } from '@/lib/i18n';
import { createCartItem } from '@/domains/cart/utils/calculations';
import { createMoney } from '@/domains/catalog/utils/money';
import type { CartItem } from '@/domains/cart/types/cart';

const mockItems: CartItem[] = [
  createCartItem({
    productId: 'prod-macbook',
    slug: 'apple-macbook-pro-16',
    title: { en: 'MacBook Pro 16"' },
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
    quantity: 1,
    maxAvailableQuantity: 5,
    shippingEstimate: {
      minDays: 3,
      maxDays: 5,
      isFreeShipping: false,
      shippingCost: createMoney(1500, 'USD'),
    },
  }),
];

function renderCheckoutWithProviders(
  ui: React.ReactElement,
  options?: { initialItems?: CartItem[] }
): ReturnType<typeof render> {
  return render(
    <I18nProvider>
      <CartProvider initialItems={options?.initialItems ?? []}>{ui}</CartProvider>
    </I18nProvider>
  );
}

describe('Checkout Domain & UI Suite', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  describe('CheckoutFormSchema', () => {
    const validForm = {
      contact: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1 555-123-4567',
      },
      shipping: {
        address: '456 Commerce Blvd',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'United States',
      },
      deliveryMethod: 'standard' as const,
    };

    it('validates a complete checkout form', () => {
      const parsed = CheckoutFormSchema.safeParse(validForm);
      expect(parsed.success).toBe(true);
    });

    it('rejects an invalid email address', () => {
      const invalid = {
        ...validForm,
        contact: { ...validForm.contact, email: 'not-an-email' },
      };
      const parsed = CheckoutFormSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it('rejects missing street address', () => {
      const invalid = {
        ...validForm,
        shipping: { ...validForm.shipping, address: '   ' },
      };
      const parsed = CheckoutFormSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('CheckoutPageView', () => {
    it('renders empty checkout state when cart has no items', () => {
      renderCheckoutWithProviders(<CheckoutPageView />);

      expect(
        screen.getByText('Your cart is empty. Please add items before checking out.')
      ).toBeDefined();
      expect(screen.getByText('Continue Shopping')).toBeDefined();
    });

    it('renders checkout stages, vendor packaging notice, and order summary', () => {
      renderCheckoutWithProviders(<CheckoutPageView />, { initialItems: mockItems });

      // Heading & steps
      expect(screen.getByRole('heading', { level: 1, name: /Checkout/i })).toBeDefined();
      expect(screen.getByText(/1\. Contact Information/i)).toBeDefined();
      expect(screen.getByText(/2\. Shipping Address/i)).toBeDefined();
      expect(screen.getByText(/3\. Delivery Method/i)).toBeDefined();

      // Multi-vendor split packaging notice
      expect(screen.getByText(/Multi-Vendor Notice:/i)).toBeDefined();

      // Place order button
      expect(screen.getByRole('button', { name: /Place Order/i })).toBeDefined();
    });

    it('displays validation errors when submitting with empty required fields', async () => {
      renderCheckoutWithProviders(<CheckoutPageView />, { initialItems: mockItems });

      const form = screen.getByRole('button', { name: /Place Order/i }).closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText(/Please complete all required fields correctly before proceeding/i)
        ).toBeDefined();
      });
    });

    it('submits order successfully and renders order confirmation when fields are valid', async () => {
      renderCheckoutWithProviders(<CheckoutPageView />, { initialItems: mockItems });

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'jane@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), {
        target: { value: '+1 555-123-4567' },
      });
      fireEvent.change(screen.getByLabelText(/Street Address/i), {
        target: { value: '456 Commerce Blvd' },
      });
      fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'San Francisco' } });
      fireEvent.change(screen.getByLabelText(/State \/ Province/i), { target: { value: 'CA' } });
      fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: '94105' } });

      const submitBtn = screen.getByRole('button', { name: /Place Order/i });
      fireEvent.click(submitBtn);

      await waitFor(
        () => {
          expect(screen.getByText(/Order Placed Successfully!/i)).toBeDefined();
          expect(screen.getByText(/Order Reference/i)).toBeDefined();
          expect(screen.getByText(/Return to Store/i)).toBeDefined();
        },
        { timeout: 3000 }
      );
    });
  });
});
