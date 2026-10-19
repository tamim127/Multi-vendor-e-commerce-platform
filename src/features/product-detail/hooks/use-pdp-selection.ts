/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — SELECTION HOOK
 * ==============================================================================
 * Comprehensive state machine managing variant matrix navigation, 5-state
 * selection resolution, multi-vendor offer routing, and quantity boundaries.
 */

'use client';

import * as React from 'react';
import { extractOptionMatrix } from '@/domains/catalog/utils/variant-matrix';
import type { ProductVariant } from '@/domains/catalog/types/variant';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import type { PdpSelectionState, UsePdpSelectionOptions, UsePdpSelectionResult } from '../types';
import { findVariantByOptions } from '../utils/variant-lookup';

export function usePdpSelection({
  product,
  offers,
  initialVariantId,
}: UsePdpSelectionOptions): UsePdpSelectionResult {
  // Extract all required dimensions across all variants
  const dimensions = React.useMemo(() => {
    return extractOptionMatrix(product.variants);
  }, [product.variants]);

  const totalDimensionsCount = dimensions.length;

  // Determine initial variant to populate default selections
  const defaultVariant = React.useMemo<ProductVariant | undefined>(() => {
    if (product.variants.length === 0) return undefined;

    if (initialVariantId) {
      const match = product.variants.find((v) => v.id === initialVariantId);
      if (match) return match;
    }

    if (product.defaultVariantId) {
      const match = product.variants.find((v) => v.id === product.defaultVariantId);
      if (match) return match;
    }

    // Fallback to first active variant or first variant
    return product.variants.find((v) => v.isActive) ?? product.variants[0];
  }, [product.variants, product.defaultVariantId, initialVariantId]);

  // Initial option selections map
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
    if (!defaultVariant) return {};
    const initialMap: Record<string, string> = {};
    for (const opt of defaultVariant.options) {
      initialMap[opt.attributeKey] = opt.value;
    }
    return initialMap;
  });

  // Explicit user-selected offer override ID
  const [selectedOfferId, setSelectedOfferId] = React.useState<string | null>(null);

  // Selected quantity
  const [quantity, setQuantity] = React.useState<number>(1);

  // When selectedOptions change, check 5-state resolution
  const hasVariants = product.variants.length > 0;
  const selectedEntries = Object.entries(selectedOptions);

  let selectionState: PdpSelectionState = 'valid_with_offers';
  let selectedVariant: ProductVariant | null = null;
  let statusMessageKey: string | null = null;

  if (hasVariants) {
    if (selectedEntries.length < totalDimensionsCount) {
      // 1. Partial Selection
      selectionState = 'partial_selection';
      selectedVariant = null;
      statusMessageKey = 'pdp.partialSelection';
    } else {
      // All dimensions selected, lookup variant
      const found = findVariantByOptions(product.variants, selectedOptions);
      if (!found) {
        // 2. Nonexistent Combination
        selectionState = 'nonexistent_combination';
        selectedVariant = null;
        statusMessageKey = 'pdp.nonexistentCombination';
      } else if (!found.isActive) {
        // 3. Inactive Variant
        selectionState = 'inactive_variant';
        selectedVariant = found;
        statusMessageKey = 'pdp.inactiveVariant';
      } else {
        // Active variant found
        selectedVariant = found;
      }
    }
  }

  // Filter eligible seller offers based on resolved variant or product
  const eligibleOffers = React.useMemo<SellerOffer[]>(() => {
    if (
      selectionState === 'partial_selection' ||
      selectionState === 'nonexistent_combination' ||
      selectionState === 'inactive_variant'
    ) {
      return [];
    }

    if (hasVariants) {
      if (!selectedVariant) return [];
      return offers.filter((o) => o.productId === product.id && o.variantId === selectedVariant.id);
    }

    // Product without variants
    return offers.filter((o) => o.productId === product.id);
  }, [offers, product.id, hasVariants, selectedVariant, selectionState]);

  // Check state 4: Variant No Offers
  if (
    selectionState !== 'partial_selection' &&
    selectionState !== 'nonexistent_combination' &&
    selectionState !== 'inactive_variant'
  ) {
    if (eligibleOffers.length === 0) {
      selectionState = 'variant_no_offers';
      statusMessageKey = 'pdp.variantNoOffers';
    } else {
      selectionState = 'valid_with_offers';
      statusMessageKey = null;
    }
  }

  // Resolve currently active offer from eligible offers
  const selectedOffer = React.useMemo<SellerOffer | null>(() => {
    if (selectionState !== 'valid_with_offers' || eligibleOffers.length === 0) {
      return null;
    }

    // Check if user previously picked a specific offer that is still eligible
    if (selectedOfferId) {
      const match = eligibleOffers.find((o) => o.offerId === selectedOfferId);
      if (match) return match;
    }

    // Default to algorithmic buy box winner if present, else first offer
    const buyBoxWinner = eligibleOffers.find((o) => o.isBuyBoxWinner);
    return buyBoxWinner ?? eligibleOffers[0]!;
  }, [selectionState, eligibleOffers, selectedOfferId]);

  /**
   * Evaluates whether a quantity value is a finite, non-negative integer.
   * Undefined is considered valid (denoting unquantified/undisclosed stock).
   * Negative numbers, fractional values, NaN, and infinities fail validation.
   */
  const inventory = selectedOffer?.inventory;
  const isInventoryValid = React.useMemo(() => {
    if (!inventory) return false;
    const qty = inventory.quantityAvailable;
    if (qty === undefined) return true;
    return typeof qty === 'number' && Number.isFinite(qty) && Number.isInteger(qty) && qty >= 0;
  }, [inventory]);

  const isBackorderPermitted =
    isInventoryValid && inventory?.state === 'backorder' && inventory?.allowsBackorder === true;

  const isInStockPurchasable =
    isInventoryValid &&
    (inventory?.state === 'in_stock' || inventory?.state === 'low_stock') &&
    (inventory?.quantityAvailable === undefined || inventory.quantityAvailable > 0);

  /**
   * CANPURCHASE (DEMO INTENT ELIGIBILITY):
   * Represents client-side demonstration intent eligibility (enabling the prototype
   * Add to Cart / Buy Now modal trigger). It strictly does NOT represent backend-verified
   * stock, merchant capacity, inventory reservation, or authorization to charge a customer.
   */
  const canPurchase =
    selectionState === 'valid_with_offers' &&
    selectedOffer !== null &&
    (isInStockPurchasable || isBackorderPermitted);

  // Deterministic inventory bounds & demonstration quantity limits
  const { minQuantity, maxQuantity, isQuantityBoundedByDemo } = React.useMemo(() => {
    if (!canPurchase || !selectedOffer || !inventory || !isInventoryValid) {
      return { minQuantity: 0, maxQuantity: 0, isQuantityBoundedByDemo: false };
    }

    if (inventory.state === 'backorder') {
      return {
        minQuantity: 1,
        maxQuantity: 10,
        isQuantityBoundedByDemo: true,
      };
    }

    if (typeof inventory.quantityAvailable === 'number') {
      return {
        minQuantity: 1,
        maxQuantity: inventory.quantityAvailable,
        isQuantityBoundedByDemo: false,
      };
    }

    // Unknown inventory client demonstration bound
    return {
      minQuantity: 1,
      maxQuantity: 10,
      isQuantityBoundedByDemo: true,
    };
  }, [canPurchase, selectedOffer, inventory, isInventoryValid]);

  // Ensure current quantity is clamped deterministically
  React.useEffect(() => {
    if (!canPurchase) {
      if (quantity !== 0) {
        setQuantity(0);
      }
    } else {
      if (quantity < minQuantity) {
        setQuantity(minQuantity);
      } else if (quantity > maxQuantity) {
        setQuantity(maxQuantity);
      }
    }
  }, [canPurchase, minQuantity, maxQuantity, quantity]);

  // Handlers
  const setOption = React.useCallback((key: string, value: string): void => {
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Reset manual offer selection to re-evaluate Buy Box winner for newly chosen variant
    setSelectedOfferId(null);
  }, []);

  const selectOffer = React.useCallback((offerId: string): void => {
    setSelectedOfferId(offerId);
  }, []);

  const handleSetQuantity = React.useCallback(
    (qty: number): void => {
      if (!canPurchase || maxQuantity === 0) {
        setQuantity(0);
        return;
      }
      const clamped = Math.max(minQuantity, Math.min(maxQuantity, qty));
      setQuantity(clamped);
    },
    [canPurchase, minQuantity, maxQuantity]
  );

  return {
    selectedOptions,
    selectedVariant,
    selectedOffer,
    selectionState,
    eligibleOffers,
    quantity,
    maxQuantity,
    isQuantityBoundedByDemo,
    canPurchase,
    statusMessageKey,
    setOption,
    selectOffer,
    setQuantity: handleSetQuantity,
  };
}
