/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — URL QUERY PARAMETERS
 * ==============================================================================
 * Tests bi-directional URL query string serialization and schema-validated parsing.
 */

import { describe, expect, it } from 'vitest';
import type { CatalogQueryParams } from '@/domains/catalog/types';
import { parseCatalogQueryParams, serializeCatalogQueryParams } from '@/domains/catalog/utils';

describe('Catalog URL Query Parameters Contract', () => {
  it('serializes complex catalog query parameters into URLSearchParams', () => {
    const params: CatalogQueryParams = {
      query: 'macbook',
      categorySlug: 'laptops',
      brandSlugs: ['apple', 'sony'],
      minPriceMinor: 100000,
      maxPriceMinor: 300000,
      sort: 'price_asc',
      page: 2,
      isFreeShipping: true,
      attributeFilters: {
        ram: ['16gb', '32gb'],
        color: ['space-black'],
      },
    };

    const searchParams = serializeCatalogQueryParams(params);

    expect(searchParams.get('q')).toBe('macbook');
    expect(searchParams.get('category')).toBe('laptops');
    expect(searchParams.get('brands')).toBe('apple,sony');
    expect(searchParams.get('minPrice')).toBe('100000');
    expect(searchParams.get('maxPrice')).toBe('300000');
    expect(searchParams.get('sort')).toBe('price_asc');
    expect(searchParams.get('page')).toBe('2');
    expect(searchParams.get('freeShipping')).toBe('true');
    expect(searchParams.get('attr_ram')).toBe('16gb,32gb');
    expect(searchParams.get('attr_color')).toBe('space-black');
  });

  it('parses valid search parameter query string into typed CatalogQueryParams', () => {
    const queryString =
      '?q=headphones&brands=sony,bose&minPrice=20000&maxPrice=50000&sort=rating_desc&attr_anc=true';
    const parsed = parseCatalogQueryParams(queryString);

    expect(parsed.query).toBe('headphones');
    expect(parsed.brandSlugs).toEqual(['sony', 'bose']);
    expect(parsed.minPriceMinor).toBe(20000);
    expect(parsed.maxPriceMinor).toBe(50000);
    expect(parsed.sort).toBe('rating_desc');
    expect(parsed.attributeFilters?.['anc']).toEqual(['true']);
  });

  it('gracefully handles empty or corrupted search parameters', () => {
    const parsed = parseCatalogQueryParams('');
    expect(parsed).toEqual({});

    const corrupted = parseCatalogQueryParams('?minPrice=not-a-number&sort=invalid_sort');
    // Schema should safely reject invalid sort and invalid number
    expect(corrupted.minPriceMinor).toBeUndefined();
    expect(corrupted.sort).toBeUndefined();
  });
});
