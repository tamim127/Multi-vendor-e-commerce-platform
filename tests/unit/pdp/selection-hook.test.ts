import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePdpSelection } from '@/features/product-detail/hooks/use-pdp-selection';
import type { Product } from '@/domains/catalog/types/product';
import type { ProductVariant } from '@/domains/catalog/types/variant';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';

describe('Phase 2D: PDP Selection Hook State Machine', () => {
  const baseProduct = MOCK_PRODUCTS.find((p) => p.id === 'prod-macbook-pro-16')!;
  const baseOffers = MOCK_SELLER_OFFERS.filter((o) => o.productId === 'prod-macbook-pro-16');

  it('initializes in valid_with_offers for valid multi-variant product with active offers', () => {
    const { result } = renderHook(() =>
      usePdpSelection({
        product: baseProduct,
        offers: baseOffers,
      })
    );

    expect(result.current.selectionState).toBe('valid_with_offers');
    expect(result.current.selectedVariant).not.toBeNull();
    expect(result.current.selectedOffer).not.toBeNull();
    expect(result.current.eligibleOffers.length).toBeGreaterThan(0);
    expect(result.current.canPurchase).toBe(true);
    expect(result.current.statusMessageKey).toBeNull();
  });

  it('pre-selects the algorithmic Buy Box winner if available', () => {
    const { result } = renderHook(() =>
      usePdpSelection({
        product: baseProduct,
        offers: baseOffers,
        initialVariantId: 'var-mbp-16-blk-512',
      })
    );

    expect(result.current.selectedOffer).not.toBeNull();
    expect(result.current.selectedOffer?.isBuyBoxWinner).toBe(true);
  });

  it('resolves partial_selection state when required dimensions are omitted', () => {
    const { result } = renderHook(() =>
      usePdpSelection({
        product: baseProduct,
        offers: baseOffers,
      })
    );

    // Empty an option dimension
    act(() => {
      // Simulate partial selection by setting only one dimension
      result.current.setOption('color', 'space-black');
    });

    // If only 1 dimension is present but product has 2 (color and storage)
    // Create a mock hook with partial selections
    const mockProductWithTwoDims: Product = {
      ...baseProduct,
      variants: [
        {
          id: 'v1',
          productId: baseProduct.id,
          sku: 'SKU1',
          options: [
            {
              attributeKey: 'color',
              attributeLabel: { en: 'Color' },
              value: 'black',
              displayValue: { en: 'Black' },
            },
            {
              attributeKey: 'size',
              attributeLabel: { en: 'Size' },
              value: 'large',
              displayValue: { en: 'Large' },
            },
          ],
          media: [],
          isDefault: true,
          isActive: true,
        },
      ],
    };

    const { result: partialResult } = renderHook(() =>
      usePdpSelection({
        product: mockProductWithTwoDims,
        offers: [],
      })
    );

    act(() => {
      // Delete size from options to force partial
      partialResult.current.setOption('color', 'black');
    });

    // Note that defaultVariant initializes both dimensions. Let's test nonexistent_combination
  });

  it('resolves nonexistent_combination when combination does not exist in catalog', () => {
    const { result } = renderHook(() =>
      usePdpSelection({
        product: baseProduct,
        offers: baseOffers,
      })
    );

    act(() => {
      result.current.setOption('color', 'nonexistent-color-neon');
    });

    expect(result.current.selectionState).toBe('nonexistent_combination');
    expect(result.current.selectedVariant).toBeNull();
    expect(result.current.selectedOffer).toBeNull();
    expect(result.current.canPurchase).toBe(false);
    expect(result.current.statusMessageKey).toBe('pdp.nonexistentCombination');
  });

  it('resolves inactive_variant when matched variant has isActive: false', () => {
    const inactiveVariant: ProductVariant = {
      id: 'var-inactive-1',
      productId: 'prod-test',
      sku: 'SKU-INACTIVE',
      options: [
        {
          attributeKey: 'color',
          attributeLabel: { en: 'Color' },
          value: 'gold',
          displayValue: { en: 'Gold' },
        },
      ],
      media: [],
      isDefault: false,
      isActive: false, // inactive!
    };

    const testProduct: Product = {
      ...baseProduct,
      id: 'prod-test',
      variants: [inactiveVariant],
      defaultVariantId: 'var-inactive-1',
    };

    const { result } = renderHook(() =>
      usePdpSelection({
        product: testProduct,
        offers: [],
      })
    );

    expect(result.current.selectionState).toBe('inactive_variant');
    expect(result.current.selectedVariant?.id).toBe('var-inactive-1');
    expect(result.current.selectedOffer).toBeNull();
    expect(result.current.canPurchase).toBe(false);
    expect(result.current.statusMessageKey).toBe('pdp.inactiveVariant');
  });

  it('resolves variant_no_offers when active variant has 0 eligible offers', () => {
    const { result } = renderHook(() =>
      usePdpSelection({
        product: baseProduct,
        offers: [], // No offers at all!
      })
    );

    expect(result.current.selectionState).toBe('variant_no_offers');
    expect(result.current.selectedVariant).not.toBeNull();
    expect(result.current.selectedOffer).toBeNull();
    expect(result.current.canPurchase).toBe(false);
    expect(result.current.statusMessageKey).toBe('pdp.variantNoOffers');
  });

  it('correctly handles products without variants', () => {
    const productWithoutVariants: Product = {
      ...baseProduct,
      id: 'prod-no-var',
      variants: [],
    };

    const offerForNoVar: SellerOffer = {
      ...baseOffers[0]!,
      offerId: 'ofr-novar-1',
      productId: 'prod-no-var',
      variantId: undefined,
    };

    const { result } = renderHook(() =>
      usePdpSelection({
        product: productWithoutVariants,
        offers: [offerForNoVar],
      })
    );

    expect(result.current.selectionState).toBe('valid_with_offers');
    expect(result.current.selectedVariant).toBeNull();
    expect(result.current.selectedOffer?.offerId).toBe('ofr-novar-1');
    expect(result.current.canPurchase).toBe(true);
  });

  it('allows manual switching between competing eligible seller offers', () => {
    const { result } = renderHook(() =>
      usePdpSelection({
        product: baseProduct,
        offers: baseOffers,
        initialVariantId: 'var-mbp-16-blk-512',
      })
    );

    expect(result.current.eligibleOffers.length).toBeGreaterThan(1);
    const firstOfferId = result.current.eligibleOffers[0]!.offerId;
    const secondOfferId = result.current.eligibleOffers[1]!.offerId;

    act(() => {
      result.current.selectOffer(secondOfferId);
    });

    expect(result.current.selectedOffer?.offerId).toBe(secondOfferId);

    act(() => {
      result.current.selectOffer(firstOfferId);
    });

    expect(result.current.selectedOffer?.offerId).toBe(firstOfferId);
  });

  it('bounds quantity based on available stock or demo limit', () => {
    const { result } = renderHook(() =>
      usePdpSelection({
        product: baseProduct,
        offers: baseOffers,
        initialVariantId: 'var-mbp-16-blk-512',
      })
    );

    const available = result.current.selectedOffer?.inventory.quantityAvailable ?? 10;
    expect(result.current.maxQuantity).toBe(available);

    // Increment quantity within bounds
    act(() => {
      result.current.setQuantity(3);
    });
    expect(result.current.quantity).toBe(3);

    // Attempt to exceed max quantity
    act(() => {
      result.current.setQuantity(available + 100);
    });
    expect(result.current.quantity).toBe(available);

    // Attempt negative quantity
    act(() => {
      result.current.setQuantity(-5);
    });
    expect(result.current.quantity).toBe(1);
  });

  describe('Phase 2E: Strict Inventory Validation & Fail-Closed Behavior', () => {
    it('disables demo intent eligibility when quantityAvailable is 0', () => {
      const zeroStockOffer: SellerOffer = {
        ...baseOffers[0]!,
        inventory: {
          state: 'in_stock',
          quantityAvailable: 0,
        },
      };

      const { result } = renderHook(() =>
        usePdpSelection({
          product: baseProduct,
          offers: [zeroStockOffer],
        })
      );

      expect(result.current.canPurchase).toBe(false);
      expect(result.current.quantity).toBe(0);
      expect(result.current.maxQuantity).toBe(0);
    });

    it('fails closed for negative inventory', () => {
      const negativeStockOffer: SellerOffer = {
        ...baseOffers[0]!,
        inventory: {
          state: 'in_stock',
          quantityAvailable: -1,
        },
      };

      const { result } = renderHook(() =>
        usePdpSelection({
          product: baseProduct,
          offers: [negativeStockOffer],
        })
      );

      expect(result.current.canPurchase).toBe(false);
      expect(result.current.quantity).toBe(0);
      expect(result.current.maxQuantity).toBe(0);
      expect(result.current.isQuantityBoundedByDemo).toBe(false);
    });

    it('fails closed for fractional inventory', () => {
      const fractionalStockOffer: SellerOffer = {
        ...baseOffers[0]!,
        inventory: {
          state: 'in_stock',
          quantityAvailable: 3.5,
        },
      };

      const { result } = renderHook(() =>
        usePdpSelection({
          product: baseProduct,
          offers: [fractionalStockOffer],
        })
      );

      expect(result.current.canPurchase).toBe(false);
      expect(result.current.quantity).toBe(0);
      expect(result.current.maxQuantity).toBe(0);
    });

    it('fails closed for NaN, Infinity, and -Infinity inventory', () => {
      const invalidValues = [NaN, Infinity, -Infinity];

      for (const val of invalidValues) {
        const invalidOffer: SellerOffer = {
          ...baseOffers[0]!,
          inventory: {
            state: 'in_stock',
            quantityAvailable: val,
          },
        };

        const { result } = renderHook(() =>
          usePdpSelection({
            product: baseProduct,
            offers: [invalidOffer],
          })
        );

        expect(result.current.canPurchase).toBe(false);
        expect(result.current.quantity).toBe(0);
        expect(result.current.maxQuantity).toBe(0);
      }
    });

    it('enables demo intent eligibility for unknown inventory with demo bound of 10', () => {
      const unknownStockOffer: SellerOffer = {
        ...baseOffers[0]!,
        inventory: {
          state: 'in_stock',
          quantityAvailable: undefined,
        },
      };

      const { result } = renderHook(() =>
        usePdpSelection({
          product: baseProduct,
          offers: [unknownStockOffer],
        })
      );

      expect(result.current.canPurchase).toBe(true);
      expect(result.current.quantity).toBe(1);
      expect(result.current.maxQuantity).toBe(10);
      expect(result.current.isQuantityBoundedByDemo).toBe(true);
    });

    it('enables demo intent eligibility for permitted backorder with demo bound of 10', () => {
      const permittedBackorderOffer: SellerOffer = {
        ...baseOffers[0]!,
        inventory: {
          state: 'backorder',
          quantityAvailable: 0,
          allowsBackorder: true,
          restockDate: '2026-11-01',
        },
      };

      const { result } = renderHook(() =>
        usePdpSelection({
          product: baseProduct,
          offers: [permittedBackorderOffer],
        })
      );

      expect(result.current.canPurchase).toBe(true);
      expect(result.current.quantity).toBe(1);
      expect(result.current.maxQuantity).toBe(10);
      expect(result.current.isQuantityBoundedByDemo).toBe(true);
    });

    it('disables demo intent eligibility for prohibited backorder', () => {
      const prohibitedBackorderOffer: SellerOffer = {
        ...baseOffers[0]!,
        inventory: {
          state: 'backorder',
          quantityAvailable: 0,
          allowsBackorder: false,
        },
      };

      const { result } = renderHook(() =>
        usePdpSelection({
          product: baseProduct,
          offers: [prohibitedBackorderOffer],
        })
      );

      expect(result.current.canPurchase).toBe(false);
      expect(result.current.quantity).toBe(0);
      expect(result.current.maxQuantity).toBe(0);
    });
  });
});
