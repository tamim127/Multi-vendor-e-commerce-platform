import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, type Locale } from '@/lib/i18n';
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';
import {
  PdpBreadcrumbs,
  PdpGallery,
  PdpHeader,
  PdpPrice,
  PdpVariantSelector,
  PdpAvailability,
  PdpSellerOffers,
  PdpPurchasePanel,
  PdpTabs,
  PdpRelatedProducts,
  PdpSkeleton,
  PdpNotFound,
} from '@/features/product-detail';

function renderWithI18n(ui: React.ReactElement, locale: Locale = 'en') {
  return render(<I18nProvider defaultLocale={locale}>{ui}</I18nProvider>);
}

describe('Phase 2D: PDP Component Suite', () => {
  const product = MOCK_PRODUCTS.find((p) => p.id === 'prod-macbook-pro-16')!;
  const offers = MOCK_SELLER_OFFERS.filter((o) => o.productId === 'prod-macbook-pro-16');
  const selectedOffer = offers[0]!;

  it('renders PdpBreadcrumbs with hierarchical trail', () => {
    renderWithI18n(<PdpBreadcrumbs product={product} />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Products')).toBeDefined();
    expect(screen.getByText(product.title.en)).toBeDefined();
  });

  it('renders PdpGallery with active media and thumbnails', () => {
    renderWithI18n(
      <PdpGallery
        productMedia={product.media}
        productTitle={product.title.en}
        badges={product.badges}
      />
    );

    // Should display media
    const mainImg = screen.getAllByRole('img');
    expect(mainImg.length).toBeGreaterThan(0);
  });

  it('renders PdpHeader with canonical title, brand, rating and SKU', () => {
    const handleReviewsClick = vi.fn();
    renderWithI18n(<PdpHeader product={product} onReviewsClick={handleReviewsClick} />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(product.title.en);
    expect(screen.getByText(product.brand.name)).toBeDefined();
    expect(screen.getByText(product.ratingSummary.average.toFixed(1))).toBeDefined();

    const reviewAnchor = screen.getByText(/customer ratings/i);
    fireEvent.click(reviewAnchor);
    expect(handleReviewsClick).toHaveBeenCalledTimes(1);
  });

  it('renders PdpPrice with formatted commercial price and compare-at strikes', () => {
    renderWithI18n(<PdpPrice selectedOffer={selectedOffer} offerSummary={product.offerSummary} />);

    expect(screen.getByText('$2,499.00')).toBeDefined();
  });

  it('renders PdpVariantSelector and handles option selection', () => {
    const handleSelect = vi.fn();
    renderWithI18n(
      <PdpVariantSelector
        variants={product.variants}
        selectedOptions={{ color: 'space-black', storage: '512gb' }}
        onSelectOption={handleSelect}
      />
    );

    // Option buttons should exist
    const silverBtn = screen.getByRole('radio', { name: /silver/i });
    fireEvent.click(silverBtn);
    expect(handleSelect).toHaveBeenCalledWith('color', 'silver');
  });

  it('renders PdpAvailability indicators correctly', () => {
    renderWithI18n(<PdpAvailability selectedOffer={selectedOffer} />);
    expect(screen.getByText(/in stock/i)).toBeDefined();
  });

  it('renders PdpSellerOffers with competing vendors and disclaimer', () => {
    const handleSelectOffer = vi.fn();
    renderWithI18n(
      <PdpSellerOffers
        eligibleOffers={offers}
        selectedOffer={selectedOffer}
        onSelectOffer={handleSelectOffer}
      />
    );

    expect(screen.getByText(/other sellers on marketplace/i)).toBeDefined();
    expect(screen.getByText(/demonstration fixture data/i)).toBeDefined();
  });

  it('renders PdpPurchasePanel with stepper and captures intent', () => {
    const handleIntent = vi.fn();
    const handleQuantity = vi.fn();

    renderWithI18n(
      <PdpPurchasePanel
        product={product}
        selectedOffer={selectedOffer}
        quantity={2}
        maxQuantity={10}
        isQuantityBoundedByDemo={false}
        canPurchase={true}
        onSetQuantity={handleQuantity}
        onPurchaseIntent={handleIntent}
      />
    );

    // Click Add to Cart
    const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartBtn);

    expect(handleIntent).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/purchase intent captured/i)).toBeDefined();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/purchase intent captured/i)).toBeNull();
  });

  it('renders PdpTabs with Overview, Specs, Reviews, and Q&A', () => {
    renderWithI18n(<PdpTabs product={product} reviews={[]} qaList={[]} />);

    expect(screen.getByRole('tab', { name: /overview/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /specifications/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /reviews/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /questions/i })).toBeDefined();
  });

  it('renders PdpRelatedProducts list', () => {
    const related = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 2);
    renderWithI18n(<PdpRelatedProducts relatedProducts={related} />);
    expect(screen.getByText(/customers also viewed/i)).toBeDefined();
  });

  it('renders PdpSkeleton and PdpNotFound components', () => {
    const { container: skeletonContainer } = renderWithI18n(<PdpSkeleton />);
    expect(skeletonContainer.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    renderWithI18n(<PdpNotFound />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Product Not Found');
  });
});
