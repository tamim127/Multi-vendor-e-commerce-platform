/**
 * ==============================================================================
 * CATALOG DOMAIN — VARIANT MATRIX UTILITIES
 * ==============================================================================
 * Multi-dimensional option resolution and matrix generation for product variants.
 */

import type { LocalizedText } from '../types/localization';
import type { ProductVariant } from '../types/variant';

export interface MatrixOptionValue {
  value: string;
  displayValue: LocalizedText;
  swatch?: string;
  isAvailable: boolean;
}

export interface MatrixDimension {
  attributeKey: string;
  attributeLabel: LocalizedText;
  values: MatrixOptionValue[];
}

/**
 * Finds a variant matching an exact set of selected option key-value pairs.
 * e.g. selectedOptions = { color: 'space-black', storage: '1tb' }
 */
export function findMatchingVariant(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>
): ProductVariant | undefined {
  const selectedEntries = Object.entries(selectedOptions);
  if (selectedEntries.length === 0) return undefined;

  return variants.find((variant) => {
    if (!variant.isActive) return false;

    // Must match every selected option dimension
    return selectedEntries.every(([key, value]) => {
      const match = variant.options.find((opt) => opt.attributeKey === key);
      return match && match.value === value;
    });
  });
}

/**
 * Extracts all distinct option dimensions and their unique values across all variants.
 */
export function extractOptionMatrix(variants: ProductVariant[]): MatrixDimension[] {
  const dimensionMap = new Map<
    string,
    {
      attributeLabel: LocalizedText;
      valuesMap: Map<
        string,
        { displayValue: LocalizedText; swatch?: string; isAvailable: boolean }
      >;
    }
  >();

  for (const variant of variants) {
    for (const opt of variant.options) {
      if (!dimensionMap.has(opt.attributeKey)) {
        dimensionMap.set(opt.attributeKey, {
          attributeLabel: opt.attributeLabel,
          valuesMap: new Map(),
        });
      }

      const dim = dimensionMap.get(opt.attributeKey)!;
      if (!dim.valuesMap.has(opt.value)) {
        dim.valuesMap.set(opt.value, {
          displayValue: opt.displayValue,
          swatch: opt.swatch,
          isAvailable: variant.isActive,
        });
      } else {
        // If any variant with this option is active, mark available
        const current = dim.valuesMap.get(opt.value)!;
        if (variant.isActive) {
          current.isAvailable = true;
        }
      }
    }
  }

  const dimensions: MatrixDimension[] = [];
  for (const [key, dim] of dimensionMap.entries()) {
    const values: MatrixOptionValue[] = Array.from(dim.valuesMap.entries()).map(
      ([value, info]) => ({
        value,
        displayValue: info.displayValue,
        swatch: info.swatch,
        isAvailable: info.isAvailable,
      })
    );

    dimensions.push({
      attributeKey: key,
      attributeLabel: dim.attributeLabel,
      values,
    });
  }

  return dimensions;
}
