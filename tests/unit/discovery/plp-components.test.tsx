/**
 * ==============================================================================
 * CATALOG DISCOVERY TEST SUITE — PLP UI COMPONENTS
 * ==============================================================================
 * Tests local PLP product presentation, pricing guidance, active filters,
 * toolbar, and mobile filter drawer local draft state isolation.
 */

import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import type { CatalogQueryParams } from '@/domains/catalog/types';
import { PlpActiveFilters } from '@/features/catalog-discovery/components/plp-active-filters';
import { PlpMobileFilterDrawer } from '@/features/catalog-discovery/components/plp-mobile-filter-drawer';
import { PlpProductItem } from '@/features/catalog-discovery/components/plp-product-item';
import { PlpToolbar } from '@/features/catalog-discovery/components/plp-toolbar';
import type { CatalogDiscoveryFacets } from '@/features/catalog-discovery/repository';
import { I18nProvider } from '@/lib/i18n';

function renderWithI18n(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

const mockFacets: CatalogDiscoveryFacets = {
  categories: [
    { id: 'cat-laptops', slug: 'laptops', label: 'Laptops', count: 2 },
    { id: 'cat-audio', slug: 'audio', label: 'Audio', count: 1 },
  ],
  brands: [
    { id: 'brand-apple', slug: 'apple', label: 'Apple', count: 2 },
    { id: 'brand-sony', slug: 'sony', label: 'Sony', count: 1 },
  ],
  inStockCount: 4,
};

describe('PLP UI Presentation Components', () => {
  describe('PlpProductItem', () => {
    it('renders product details and displays "From" for multiple offers', () => {
      // Find a mock product with multiple offers (e.g. MacBook Pro)
      const multiOfferProduct = MOCK_PRODUCTS.find((p) => p.offerSummary.hasMultipleOffers)!;
      expect(multiOfferProduct).toBeDefined();

      renderWithI18n(<PlpProductItem product={multiOfferProduct} />);

      // Verify title and brand
      expect(screen.getByText(multiOfferProduct.title.en)).toBeDefined();
      expect(screen.getByText(multiOfferProduct.brand.name)).toBeDefined();

      // Verify "From" lowest price display
      expect(screen.getByText(/From/i)).toBeDefined();
      expect(
        screen.getByText(new RegExp(`${multiOfferProduct.offerSummary.offerCount} offers`, 'i'))
      ).toBeDefined();
    });

    it('renders single offer without "From" prefix when hasMultipleOffers is false', () => {
      const singleOfferProduct = MOCK_PRODUCTS.find((p) => !p.offerSummary.hasMultipleOffers);
      if (singleOfferProduct) {
        renderWithI18n(<PlpProductItem product={singleOfferProduct} />);
        expect(screen.queryByText(/offers/i)).toBeNull();
      }
    });
  });

  describe('PlpActiveFilters', () => {
    it('renders active filter chips and calls remove handlers', () => {
      const onRemoveBrand = vi.fn();
      const onRemoveCategory = vi.fn();
      const onClearAll = vi.fn();

      const params: CatalogQueryParams = {
        categorySlug: 'laptops',
        brandSlugs: ['apple'],
        minPriceMinor: 10000,
        maxPriceMinor: 50000,
        minRating: 4,
        inventoryStates: ['in_stock'],
      };

      renderWithI18n(
        <PlpActiveFilters
          params={params}
          onRemoveCategory={onRemoveCategory}
          onRemoveBrand={onRemoveBrand}
          onRemovePrice={vi.fn()}
          onRemoveRating={vi.fn()}
          onRemoveInStock={vi.fn()}
          onClearAll={onClearAll}
        />
      );

      // Verify Apple brand chip is displayed
      expect(screen.getByText('Apple')).toBeDefined();

      // Click remove button for brand chip
      const removeBrandBtn = screen.getByLabelText(/Remove brand filter: Apple/i);
      fireEvent.click(removeBrandBtn);
      expect(onRemoveBrand).toHaveBeenCalledWith('apple');

      // Click clear all
      const clearAllBtn = screen.getByText(/Clear all/i);
      fireEvent.click(clearAllBtn);
      expect(onClearAll).toHaveBeenCalled();
    });

    it('renders null when no filters are active', () => {
      const { container } = renderWithI18n(
        <PlpActiveFilters
          params={{}}
          onRemoveCategory={vi.fn()}
          onRemoveBrand={vi.fn()}
          onRemovePrice={vi.fn()}
          onRemoveRating={vi.fn()}
          onRemoveInStock={vi.fn()}
          onClearAll={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('PlpToolbar', () => {
    it('renders results count and handles sort change', () => {
      const onSortChange = vi.fn();
      const onOpenMobileFilters = vi.fn();

      renderWithI18n(
        <PlpToolbar
          totalCount={24}
          currentSort="newest"
          onSortChange={onSortChange}
          onOpenMobileFilters={onOpenMobileFilters}
          activeFiltersCount={2}
        />
      );

      expect(screen.getByText(/Showing 24 products/i)).toBeDefined();

      const select = screen.getByLabelText(/Sort By/i);
      fireEvent.change(select, { target: { value: 'price_asc' } });
      expect(onSortChange).toHaveBeenCalledWith('price_asc');

      const mobileFilterBtn = screen.getByLabelText(/Filters/i);
      fireEvent.click(mobileFilterBtn);
      expect(onOpenMobileFilters).toHaveBeenCalled();
    });
  });

  describe('PlpMobileFilterDrawer (Draft State Isolation)', () => {
    it('manages local draft state independently until Apply is clicked', () => {
      const onApplyDraft = vi.fn();
      const onClose = vi.fn();

      const canonicalParams: CatalogQueryParams = {
        categorySlug: 'laptops',
      };

      renderWithI18n(
        <PlpMobileFilterDrawer
          isOpen={true}
          onClose={onClose}
          canonicalParams={canonicalParams}
          facets={mockFacets}
          onApplyDraft={onApplyDraft}
        />
      );

      // Verify initial state renders drawer title
      expect(screen.getByText('Filters')).toBeDefined();

      // Check Sony brand checkbox inside drawer
      const sonyCheckbox = screen.getByLabelText('Sony');
      fireEvent.click(sonyCheckbox);

      // Apply was not called yet!
      expect(onApplyDraft).not.toHaveBeenCalled();

      // Click Apply Filters button
      const applyBtn = screen.getByRole('button', { name: /Apply Filters/i });
      fireEvent.click(applyBtn);

      // Now onApplyDraft should have been called with the draft containing Sony
      expect(onApplyDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          categorySlug: 'laptops',
          brandSlugs: ['sony'],
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
