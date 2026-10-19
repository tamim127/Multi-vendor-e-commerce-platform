/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — SHIPPING FORMATTING UTILITY
 * ==============================================================================
 * Truthful shipping estimate resolution, delivery-window validation, and resilient
 * fallback formatting. Never fabricates delivery costs or turnaround windows.
 */

import type { ShippingEstimate } from '@/domains/catalog/types/seller-offer';
import { CURRENCY_METADATA_REGISTRY, formatMoneyMinor } from '@/domains/catalog/utils/money';

export interface FormattedShippingDisplay {
  label: string;
  detail?: string;
  isFree: boolean;
  isCalculatedAtCheckout: boolean;
}

export interface FormatShippingOptions {
  locale?: string;
  freeDeliveryText?: string;
  calculatedAtCheckoutText?: string;
}

/**
 * Validates whether delivery turnaround bounds constitute a finite, non-negative,
 * monotonically non-decreasing window (minDays <= maxDays).
 */
export function isValidDayRange(minDays: unknown, maxDays: unknown): boolean {
  return (
    typeof minDays === 'number' &&
    typeof maxDays === 'number' &&
    Number.isFinite(minDays) &&
    Number.isFinite(maxDays) &&
    Number.isInteger(minDays) &&
    Number.isInteger(maxDays) &&
    minDays >= 0 &&
    maxDays >= 0 &&
    maxDays >= minDays
  );
}

/**
 * Formats a commercial shipping estimate with strict currency and delivery-window validation.
 * Falls back safely to localized calculated-at-checkout state rather than guessing.
 */
export function formatShippingEstimate(
  estimate?: ShippingEstimate | null,
  options?: FormatShippingOptions
): FormattedShippingDisplay {
  const defaultFree = options?.freeDeliveryText ?? 'Free Delivery';
  const defaultCalculated = options?.calculatedAtCheckoutText ?? 'Shipping calculated at checkout';

  if (!estimate) {
    return {
      label: defaultCalculated,
      detail: undefined,
      isFree: false,
      isCalculatedAtCheckout: true,
    };
  }

  // Validate delivery turnaround window
  const hasValidDays = isValidDayRange(estimate.minDays, estimate.maxDays);
  const daysSuffix =
    hasValidDays && estimate.maxDays > 0
      ? `(${estimate.minDays}–${estimate.maxDays} days)`
      : undefined;

  // Rule 1: Free shipping strictly when isFreeShipping is true
  if (estimate.isFreeShipping === true) {
    return {
      label: defaultFree,
      detail: daysSuffix,
      isFree: true,
      isCalculatedAtCheckout: false,
    };
  }

  // Rule 2: Paid shipping with strict structural and currency registry validation
  const cost = estimate.shippingCost;
  if (
    cost &&
    typeof cost.amountMinor === 'number' &&
    Number.isFinite(cost.amountMinor) &&
    Number.isInteger(cost.amountMinor) &&
    cost.amountMinor > 0 &&
    typeof cost.currency === 'string' &&
    cost.currency in CURRENCY_METADATA_REGISTRY
  ) {
    try {
      const formattedCost = formatMoneyMinor(cost, { locale: options?.locale ?? 'en-US' });
      return {
        label: `+ ${formattedCost}`,
        detail: daysSuffix,
        isFree: false,
        isCalculatedAtCheckout: false,
      };
    } catch {
      return {
        label: defaultCalculated,
        detail: daysSuffix,
        isFree: false,
        isCalculatedAtCheckout: true,
      };
    }
  }

  // Rule 3: Any missing cost, non-positive amount, non-integer, or unsupported currency
  // defaults safely to calculated at checkout. Never displays speculative pricing.
  return {
    label: defaultCalculated,
    detail: daysSuffix,
    isFree: false,
    isCalculatedAtCheckout: true,
  };
}
