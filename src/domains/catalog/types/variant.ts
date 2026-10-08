/**
 * ==============================================================================
 * CATALOG DOMAIN — PRODUCT VARIANT & SKU TYPES
 * ==============================================================================
 * Decoupled variant/SKU structure.
 * Represents customer-facing option configurations (e.g. Color, Size, Storage).
 * Authoritative commercial pricing and stock belong exclusively to SellerOffer.
 */

import type { LocalizedText } from './localization';
import type { ProductMedia } from './media';
import type { Money } from './pricing';

export interface VariantOptionValue {
  /** The attribute identifier, e.g. "color", "storage", "size" */
  attributeKey: string;
  /** Localized attribute label, e.g. "Color" / "রং" */
  attributeLabel: LocalizedText;
  /** Raw canonical value, e.g. "space-black", "1tb", "us-10" */
  value: string;
  /** Localized display value, e.g. "Space Black" / "স্পেস ব্ল্যাক" */
  displayValue: LocalizedText;
  /** Visual swatch (HEX code, image URL, or CSS gradient) */
  swatch?: string;
}

export type WeightUnit = 'g' | 'kg' | 'lb' | 'oz';
export type DimensionUnit = 'cm' | 'in' | 'mm';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface ProductWeight {
  value: number;
  unit: WeightUnit;
}

export interface ProductVariant {
  id: string;
  productId: string;
  /** Stock Keeping Unit code */
  sku: string;
  /** Multi-dimensional option set, e.g. [ { attributeKey: 'color', ... }, { attributeKey: 'storage', ... } ] */
  options: VariantOptionValue[];
  /** Variant-specific imagery (e.g. black laptop photos) */
  media: ProductMedia[];
  /**
   * NON-AUTHORITATIVE manufacturer suggested retail price (MSRP).
   * For catalog indexing and comparison only; authoritative commercial pricing
   * is provided exclusively by SellerOffer entities.
   */
  msrpReference?: Money;
  /** Barcode / UPC / EAN / GTIN */
  barcode?: string;
  /** Physical weight readiness for shipping engines */
  weight?: ProductWeight;
  /** Dimensions readiness for parcel calculations */
  dimensions?: ProductDimensions;
  isDefault: boolean;
  isActive: boolean;
}
