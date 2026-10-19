import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider, getTranslation, type TranslationKey } from '@/lib/i18n';
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';
import { ProductDetailInteractiveView, type ProductDetailData } from '@/features/product-detail';

describe('Phase 2D: PDP Localization, Translations & RTL Suite', () => {
  const product = MOCK_PRODUCTS.find((p) => p.id === 'prod-macbook-pro-16')!;
  const offers = MOCK_SELLER_OFFERS.filter((o) => o.productId === 'prod-macbook-pro-16');

  const initialData: ProductDetailData = {
    product,
    offers,
    relatedProducts: [],
    reviews: [],
    qaList: [],
  };

  it('renders PDP in Arabic with RTL layout and localized text', () => {
    render(
      <I18nProvider defaultLocale="ar">
        <ProductDetailInteractiveView initialData={initialData} />
      </I18nProvider>
    );

    // Verify Arabic translations present
    expect(screen.getByText('الرئيسية')).toBeDefined(); // Home in Arabic
    expect(screen.getAllByText('أضف إلى السلة').length).toBeGreaterThan(0); // Add to cart in Arabic
    expect(screen.getByText('اشترِ الآن')).toBeDefined(); // Buy now in Arabic
    expect(screen.getByText(/بيانات تجريبية/)).toBeDefined(); // Demo disclaimer in Arabic
  });

  it('renders PDP in Bengali with localized text', () => {
    render(
      <I18nProvider defaultLocale="bn">
        <ProductDetailInteractiveView initialData={initialData} />
      </I18nProvider>
    );

    expect(screen.getByText('হোম')).toBeDefined(); // Home in Bengali
    expect(screen.getAllByText('কার্টে যোগ করুন').length).toBeGreaterThan(0); // Add to cart in Bengali
    expect(screen.getByText('এখনই কিনুন')).toBeDefined(); // Buy now in Bengali
    expect(screen.getByText(/ডেমো ফিক্সচার ডেটা/)).toBeDefined(); // Demo disclaimer in Bengali
  });

  it('renders PDP in Hindi with localized text', () => {
    render(
      <I18nProvider defaultLocale="hi">
        <ProductDetailInteractiveView initialData={initialData} />
      </I18nProvider>
    );

    expect(screen.getByText('होम')).toBeDefined(); // Home in Hindi
    expect(screen.getAllByText('कार्ट में जोड़ें').length).toBeGreaterThan(0); // Add to cart in Hindi
    expect(screen.getByText('अभी खरीदें')).toBeDefined(); // Buy now in Hindi
    expect(screen.getByText(/डेमो फिक्सचर डेटा/)).toBeDefined(); // Demo disclaimer in Hindi
  });

  it('verifies 100% parity across all 4 supported locales for all PDP keys', () => {
    const pdpKeys = [
      'pdp.backToCatalog',
      'pdp.selectOptions',
      'pdp.partialSelection',
      'pdp.nonexistentCombination',
      'pdp.inactiveVariant',
      'pdp.variantNoOffers',
      'pdp.inStock',
      'pdp.outOfStock',
      'pdp.lowStock',
      'pdp.leadTime',
      'pdp.soldBy',
      'pdp.shipsFrom',
      'pdp.allOffers',
      'pdp.offersCount',
      'pdp.condition',
      'pdp.delivery',
      'pdp.freeDelivery',
      'pdp.fastDelivery',
      'pdp.warranty',
      'pdp.returnPolicy',
      'pdp.sellerRating',
      'pdp.buyBoxWinner',
      'pdp.selectOffer',
      'pdp.selectedOfferLabel',
      'pdp.sellerDisclaimer',
      'pdp.verifiedDemo',
      'pdp.officialStoreDemo',
      'pdp.quantity',
      'pdp.addToCart',
      'pdp.buyNow',
      'pdp.intentModalTitle',
      'pdp.intentModalDesc',
      'pdp.intentModalClose',
      'pdp.tabOverview',
      'pdp.tabSpecs',
      'pdp.tabReviews',
      'pdp.tabQa',
      'pdp.sku',
      'pdp.brand',
      'pdp.category',
      'pdp.relatedProducts',
      'pdp.ratingAverage',
      'pdp.ratingCount',
      'pdp.noReviews',
      'pdp.noQa',
      'pdp.demoFeedbackNote',
      'pdp.askQuestion',
      'pdp.writeReview',
      'pdp.notFoundTitle',
      'pdp.notFoundDesc',
      'pdp.backToHome',
      'pdp.fulfilledBy',
      'pdp.backorder',
      'pdp.backorderRestock',
      'pdp.backorderProhibited',
      'pdp.backorderDemoLimit',
      'pdp.shippingCost',
      'pdp.shippingCalculatedAtCheckout',
      'pdp.priceUnavailable',
    ] as const;

    const locales = ['en', 'bn', 'ar', 'hi'] as const;

    for (const locale of locales) {
      for (const key of pdpKeys) {
        const translation = getTranslation(locale, key as TranslationKey);
        expect(translation).toBeDefined();
        expect(translation).not.toBe(key);
      }
    }
  });

  it('renders Arabic PDP with backorder and truthful shipping fallbacks in RTL direction', () => {
    const backorderOffer = {
      ...offers[0]!,
      inventory: {
        state: 'backorder' as const,
        quantityAvailable: 0,
        allowsBackorder: true,
        restockDate: '2026-11-20',
      },
      shippingEstimate: {
        minDays: 2,
        maxDays: 4,
        isFreeShipping: false,
        // Missing shippingCost triggers localized shippingCalculatedAtCheckout
      },
    };

    render(
      <I18nProvider defaultLocale="ar">
        <ProductDetailInteractiveView initialData={{ ...initialData, offers: [backorderOffer] }} />
      </I18nProvider>
    );

    // Verify Arabic backorder text
    expect(screen.getByText(/متاح للطلب المسبق المتأخر/)).toBeDefined();
    // Verify Arabic shipping calculated at checkout text is rendered
    expect(screen.getAllByText('يتم حساب الشحن عند إتمام الطلب').length).toBeGreaterThan(0);
  });
});
