/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — VARIANT LOOKUP UTILITIES
 * ==============================================================================
 * Dedicated inactive-aware variant lookup utility.
 * Unlike canonical findMatchingVariant() which strictly enforces variant.isActive === true,
 * this utility resolves any variant matching the option matrix regardless of active status,
 * enabling PDP to accurately distinguish between 'nonexistent_combination' and 'inactive_variant'.
 */

import type { ProductVariant } from '@/domains/catalog/types/variant';

/**
 * Finds a variant matching an exact set of selected option key-value pairs,
 * regardless of variant.isActive.
 */
export function findVariantByOptions(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>
): ProductVariant | undefined {
  const selectedEntries = Object.entries(selectedOptions);
  if (selectedEntries.length === 0) return undefined;

  return variants.find((variant) => {
    return selectedEntries.every(([key, value]) => {
      const match = variant.options.find((opt) => opt.attributeKey === key);
      return match && match.value === value;
    });
  });
}
