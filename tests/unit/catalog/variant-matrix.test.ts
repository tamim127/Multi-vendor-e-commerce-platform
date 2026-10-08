/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — VARIANT MATRIX
 * ==============================================================================
 * Tests multi-dimensional variant matching and option matrix extraction.
 */

import { describe, expect, it } from 'vitest';
import { MOCK_VARIANTS } from '@/domains/catalog/fixtures';
import { extractOptionMatrix, findMatchingVariant } from '@/domains/catalog/utils';

describe('Variant Matrix & Option Resolution', () => {
  const mbpVariants = MOCK_VARIANTS.filter((v) => v.productId === 'prod-macbook-pro-16');

  it('matches variant by exact multi-dimensional option combinations', () => {
    const matched = findMatchingVariant(mbpVariants, {
      color: 'space-black',
      storage: '1tb',
    });
    expect(matched).toBeDefined();
    expect(matched?.id).toBe('var-mbp-16-blk-1tb');
    expect(matched?.sku).toBe('APL-MBP16-M3M-SB-1TB');
  });

  it('matches silver 512gb variant correctly', () => {
    const matched = findMatchingVariant(mbpVariants, {
      color: 'silver',
      storage: '512gb',
    });
    expect(matched).toBeDefined();
    expect(matched?.id).toBe('var-mbp-16-slv-512');
  });

  it('returns undefined when option combination does not exist', () => {
    const matched = findMatchingVariant(mbpVariants, {
      color: 'space-black',
      storage: '4tb', // Non-existent option
    });
    expect(matched).toBeUndefined();
  });

  it('extracts distinct option dimensions and values', () => {
    const matrix = extractOptionMatrix(mbpVariants);
    expect(matrix.length).toBe(2);

    const colorDimension = matrix.find((d) => d.attributeKey === 'color');
    expect(colorDimension).toBeDefined();
    expect(colorDimension?.values.length).toBe(2);
    expect(colorDimension?.values.map((v) => v.value)).toContain('space-black');
    expect(colorDimension?.values.map((v) => v.value)).toContain('silver');

    const storageDimension = matrix.find((d) => d.attributeKey === 'storage');
    expect(storageDimension).toBeDefined();
    expect(storageDimension?.values.length).toBe(2);
    expect(storageDimension?.values.map((v) => v.value)).toContain('512gb');
    expect(storageDimension?.values.map((v) => v.value)).toContain('1tb');
  });
});
