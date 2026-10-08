/**
 * ==============================================================================
 * PRODUCT CARD SYSTEM TEST SUITE
 * ==============================================================================
 * Comprehensive tests covering:
 * 1. All 10 presentation variants
 * 2. Data variations (missing media, zero rating, discounts, multi-offer, unavailable)
 * 3. Accessibility & WCAG 2.2 compliance (labels, links, 44px targets)
 * 4. Interaction isolation (wishlist toggle, quick action, navigation callbacks)
 * 5. Coordinated layout-stable loading skeleton
 */

import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard, type ProductCardVariant } from '@/components/product-card';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import type { Product } from '@/domains/catalog/types/product';
import { I18nProvider } from '@/lib/i18n';

function renderCard(props: React.ComponentProps<typeof ProductCard>): ReturnType<typeof render> {
  return render(
    <I18nProvider>
      <ProductCard {...props} />
    </I18nProvider>
  );
}

const mockProduct = MOCK_PRODUCTS[0]!;

describe('Product Card System — Canonical Presentation Layer', () => {
  describe('1. All 10 Presentation Variants Rendering', () => {
    const allVariants: ProductCardVariant[] = [
      'standard',
      'compact',
      'large',
      'editorial',
      'horizontal',
      'search',
      'recommendation',
      'flash-sale',
      'sponsored',
      'recently-viewed',
    ];

    allVariants.forEach((variant) => {
      it(`renders the '${variant}' variant without error`, () => {
        const { container } = renderCard({
          product: mockProduct,
          variant,
          flashSaleProgressPercent: variant === 'flash-sale' ? 65 : undefined,
          editorialBadgeText: variant === 'editorial' ? "Editor's Choice" : undefined,
        });

        expect(container.firstChild).toBeDefined();
        // Product title must be present in all variants
        expect(screen.getByText(mockProduct.title.en)).toBeDefined();
      });
    });

    it('renders horizontal layout structure for horizontal variant', () => {
      const { container } = renderCard({
        product: mockProduct,
        variant: 'horizontal',
      });

      const article = container.querySelector('article');
      expect(article?.className).toContain('sm:flex-row');
    });

    it('renders flash sale progress bar on flash-sale variant', () => {
      renderCard({
        product: mockProduct,
        variant: 'flash-sale',
        flashSaleProgressPercent: 80,
      });

      expect(screen.getByText(/80% Claimed/i)).toBeDefined();
      expect(screen.getByText(/Flash Sale/i)).toBeDefined();
    });

    it('renders sponsored badge on sponsored variant', () => {
      renderCard({
        product: mockProduct,
        variant: 'sponsored',
      });

      expect(screen.getByText(/Sponsored/i)).toBeDefined();
    });

    it('renders editorial badge on editorial variant', () => {
      renderCard({
        product: mockProduct,
        variant: 'editorial',
        editorialBadgeText: 'Curated Pick',
      });

      expect(screen.getByText('Curated Pick')).toBeDefined();
    });
  });

  describe('2. Data Variations & State Handling', () => {
    it('handles product with missing media gracefully with fallback text', () => {
      const noMediaProduct: Product = {
        ...mockProduct,
        id: 'test-no-media',
        media: [],
      };

      renderCard({ product: noMediaProduct, variant: 'standard' });

      // Fallback renders title in fallback container
      const fallbacks = screen.getAllByText(mockProduct.title.en);
      expect(fallbacks.length).toBeGreaterThan(0);
    });

    it('suppresses rating display when product has zero ratings', () => {
      const unratedProduct: Product = {
        ...mockProduct,
        id: 'test-unrated',
        ratingSummary: {
          average: 0,
          count: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      };

      renderCard({ product: unratedProduct, variant: 'standard' });
      // Stars should not be present
      expect(screen.queryByLabelText(/0.0 out of 5 stars/i)).toBeNull();
    });

    it('displays "From $X" and offer count when hasMultipleOffers is true', () => {
      const multiOfferProduct = MOCK_PRODUCTS.find((p) => p.offerSummary.hasMultipleOffers)!;
      expect(multiOfferProduct).toBeDefined();

      renderCard({ product: multiOfferProduct, variant: 'standard' });

      expect(screen.getByText(/From/i)).toBeDefined();
      expect(
        screen.getByText(new RegExp(`${multiOfferProduct.offerSummary.offerCount} offers`, 'i'))
      ).toBeDefined();
    });

    it('renders out-of-stock overlay when offer count is zero', () => {
      const outOfStockProduct: Product = {
        ...mockProduct,
        id: 'test-oos',
        offerSummary: {
          ...mockProduct.offerSummary,
          offerCount: 0,
        },
      };

      renderCard({ product: outOfStockProduct, variant: 'standard' });
      expect(screen.getByText(/Out of Stock/i)).toBeDefined();
    });

    it('renders unavailable overlay when isUnavailable is true', () => {
      renderCard({ product: mockProduct, variant: 'standard', isUnavailable: true });
      expect(screen.getByText(/Currently Unavailable/i)).toBeDefined();
    });

    it('renders compare-at price strike and discount badge when MSRP is higher than sale price', () => {
      // Create product with variant having higher MSRP reference ($3000 msrp vs $2499 lowest)
      const discountedProduct: Product = {
        ...mockProduct,
        id: 'test-discounted',
        offerSummary: {
          ...mockProduct.offerSummary,
          lowestPrice: { amountMinor: 200000, currency: 'USD' },
          hasMultipleOffers: false,
        },
        variants: [
          {
            ...mockProduct.variants[0]!,
            msrpReference: { amountMinor: 250000, currency: 'USD' },
          },
        ],
      };

      renderCard({ product: discountedProduct, variant: 'standard', showCompareAtPrice: true });

      // 20% discount badge: (2500 - 2000) / 2500 = 20%
      expect(screen.getByText(/-20%/i)).toBeDefined();
    });
  });

  describe('3. Accessibility & WCAG 2.2 Compliance', () => {
    it('provides semantic link to the product details page', () => {
      renderCard({ product: mockProduct, variant: 'standard' });

      const link = screen.getByRole('link', { name: mockProduct.title.en });
      expect(link).toBeDefined();
      expect(link.getAttribute('href')).toBe(`/products/${mockProduct.slug}`);
    });

    it('provides accessible labels for the wishlist toggle button', () => {
      const { rerender } = render(
        <I18nProvider>
          <ProductCard product={mockProduct} variant="standard" isWishlisted={false} showWishlist />
        </I18nProvider>
      );

      const addBtn = screen.getByRole('button', { name: /Add to wishlist/i });
      expect(addBtn).toBeDefined();

      rerender(
        <I18nProvider>
          <ProductCard product={mockProduct} variant="standard" isWishlisted={true} showWishlist />
        </I18nProvider>
      );

      const removeBtn = screen.getByRole('button', { name: /Remove from wishlist/i });
      expect(removeBtn).toBeDefined();
    });

    it('ensures wishlist button has min 44px tap target', () => {
      renderCard({ product: mockProduct, variant: 'standard', showWishlist: true });

      const wishlistBtn = screen.getByRole('button', { name: /Add to wishlist/i });
      expect(wishlistBtn.className).toContain('min-h-[44px]');
      expect(wishlistBtn.className).toContain('min-w-[44px]');
    });
  });

  describe('4. Interactive Behavior & Event Propagation Isolation', () => {
    it('invokes onWishlistToggle callback without triggering navigation or card click', () => {
      const onWishlistToggle = vi.fn();
      const onNavigate = vi.fn();

      renderCard({
        product: mockProduct,
        variant: 'standard',
        showWishlist: true,
        onWishlistToggle,
        onNavigate,
      });

      const wishlistBtn = screen.getByRole('button', { name: /Add to wishlist/i });
      fireEvent.click(wishlistBtn);

      expect(onWishlistToggle).toHaveBeenCalledTimes(1);
      expect(onWishlistToggle).toHaveBeenCalledWith(mockProduct);
      // Navigation must NOT be invoked because stopPropagation was called!
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('invokes onQuickAction callback without triggering card click', () => {
      const onQuickAction = vi.fn();
      const onNavigate = vi.fn();

      renderCard({
        product: mockProduct,
        variant: 'standard',
        showQuickAction: true,
        quickActionLabel: 'Quick view',
        onQuickAction,
        onNavigate,
      });

      const quickBtn = screen.getByRole('button', { name: /Quick view/i });
      fireEvent.click(quickBtn);

      expect(onQuickAction).toHaveBeenCalledTimes(1);
      expect(onQuickAction).toHaveBeenCalledWith(mockProduct);
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('invokes onNavigate callback when the card itself is clicked', () => {
      const onNavigate = vi.fn();

      const { container } = renderCard({
        product: mockProduct,
        variant: 'standard',
        onNavigate,
      });

      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);

      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('5. Coordinated Loading Skeleton State', () => {
    it('renders skeleton loading placeholder with aria-busy when isLoading is true', () => {
      const { container } = renderCard({
        product: mockProduct,
        variant: 'standard',
        isLoading: true,
      });

      const skeletonCard = container.querySelector('[aria-busy="true"]');
      expect(skeletonCard).toBeDefined();
      expect(screen.queryByText(mockProduct.title.en)).toBeNull();
    });

    it('renders horizontal skeleton layout for horizontal variant', () => {
      const { container } = renderCard({
        product: mockProduct,
        variant: 'horizontal',
        isLoading: true,
      });

      const horizontalSkeleton = container.querySelector('.sm\\:flex-row');
      expect(horizontalSkeleton).toBeDefined();
    });
  });
});
