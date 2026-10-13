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

  // Inventory bounds & demonstration quantity limits
  const { maxQuantity, isQuantityBoundedByDemo } = React.useMemo(() => {
    if (!selectedOffer) {
      return { maxQuantity: 1, isQuantityBoundedByDemo: false };
    }

    if (typeof selectedOffer.inventory.quantityAvailable === 'number') {
      return {
        maxQuantity: Math.max(1, selectedOffer.inventory.quantityAvailable),
        isQuantityBoundedByDemo: false,
      };
    }

    // Demonstration client fallback bound
    return {
      maxQuantity: 10,
      isQuantityBoundedByDemo: true,
    };
  }, [selectedOffer]);

  // Ensure current quantity is clamped
  React.useEffect(() => {
    if (quantity > maxQuantity) {
      setQuantity(maxQuantity);
    } else if (quantity < 1) {
      setQuantity(1);
    }
  }, [maxQuantity, quantity]);

  // Can purchase logic
  const canPurchase =
    selectionState === 'valid_with_offers' &&
    selectedOffer !== null &&
    selectedOffer.inventory.state === 'in_stock' &&
    (selectedOffer.inventory.quantityAvailable === undefined ||
      selectedOffer.inventory.quantityAvailable > 0);

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
      const clamped = Math.max(1, Math.min(maxQuantity, qty));
      setQuantity(clamped);
    },
    [maxQuantity]
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
