/**
 * ==============================================================================
 * CATALOG DOMAIN — PRODUCT ATTRIBUTE TYPES
 * ==============================================================================
 * Extensible, strongly-typed specification and faceting attributes.
 */

import type { LocalizedText } from './localization';

export type AttributeType = 'text' | 'number' | 'boolean' | 'enum' | 'range' | 'measurement';

export type AttributeGroup =
  | 'general'
  | 'technical'
  | 'dimensions'
  | 'material'
  | 'performance'
  | 'warranty'
  | 'connectivity'
  | (string & {});

export type AttributeValue = string | number | boolean | string[];

export interface ProductAttribute {
  id: string;
  key: string;
  label: LocalizedText;
  type: AttributeType;
  value: AttributeValue;
  /** Display value with formatting or localized label if different from raw value */
  displayValue?: LocalizedText;
  unit?: string;
  group: AttributeGroup;
  isFilterable: boolean;
  isSearchable: boolean;
  isVisibleOnPdp: boolean;
  order?: number;
}
