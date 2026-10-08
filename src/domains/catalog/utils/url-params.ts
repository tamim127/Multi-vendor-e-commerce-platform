/**
 * ==============================================================================
 * CATALOG DOMAIN — URL QUERY PARAMETER UTILITIES
 * ==============================================================================
 * Bi-directional type-safe serialization and parsing of catalog search & filter
 * URL state. Validated using CatalogQueryParamsSchema.
 */

import { CatalogQueryParamsSchema } from '../schemas/query.schema';
import type { CatalogQueryParams } from '../types/query';

/**
 * Serializes CatalogQueryParams into standard URLSearchParams.
 */
export function serializeCatalogQueryParams(params: CatalogQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('q', params.query);
  if (params.categorySlug) searchParams.set('category', params.categorySlug);
  if (params.categoryPath) searchParams.set('path', params.categoryPath);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);

  if (params.brandSlugs && params.brandSlugs.length > 0) {
    searchParams.set('brands', params.brandSlugs.join(','));
  }

  if (params.sellerIds && params.sellerIds.length > 0) {
    searchParams.set('sellers', params.sellerIds.join(','));
  }

  if (typeof params.minPriceMinor === 'number') {
    searchParams.set('minPrice', params.minPriceMinor.toString());
  }

  if (typeof params.maxPriceMinor === 'number') {
    searchParams.set('maxPrice', params.maxPriceMinor.toString());
  }

  if (params.currency) searchParams.set('currency', params.currency);
  if (typeof params.minRating === 'number')
    searchParams.set('minRating', params.minRating.toString());

  if (params.inventoryStates && params.inventoryStates.length > 0) {
    searchParams.set('stock', params.inventoryStates.join(','));
  }

  if (params.badgeTypes && params.badgeTypes.length > 0) {
    searchParams.set('badges', params.badgeTypes.join(','));
  }

  if (params.conditions && params.conditions.length > 0) {
    searchParams.set('conditions', params.conditions.join(','));
  }

  if (params.isFreeShipping) searchParams.set('freeShipping', 'true');

  if (params.attributeFilters) {
    for (const [key, values] of Object.entries(params.attributeFilters)) {
      if (values.length > 0) {
        searchParams.set(`attr_${key}`, values.join(','));
      }
    }
  }

  if (params.sort) searchParams.set('sort', params.sort);
  if (params.page && params.page > 1) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.locale) searchParams.set('locale', params.locale);

  return searchParams;
}

/**
 * Parses and validates URLSearchParams or raw query string into CatalogQueryParams.
 * Invalid parameters are safely rejected or discarded through Zod validation.
 */
export function parseCatalogQueryParams(input: URLSearchParams | string): CatalogQueryParams {
  const searchParams =
    typeof input === 'string'
      ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
      : input;

  const raw: Record<string, unknown> = {};

  const q = searchParams.get('q');
  if (q) raw['query'] = q;

  const category = searchParams.get('category');
  if (category) raw['categorySlug'] = category;

  const path = searchParams.get('path');
  if (path) raw['categoryPath'] = path;

  const categoryId = searchParams.get('categoryId');
  if (categoryId) raw['categoryId'] = categoryId;

  const brands = searchParams.get('brands');
  if (brands)
    raw['brandSlugs'] = brands
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const sellers = searchParams.get('sellers');
  if (sellers)
    raw['sellerIds'] = sellers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const minPrice = searchParams.get('minPrice');
  if (minPrice && !Number.isNaN(Number(minPrice))) raw['minPriceMinor'] = parseInt(minPrice, 10);

  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice && !Number.isNaN(Number(maxPrice))) raw['maxPriceMinor'] = parseInt(maxPrice, 10);

  const currency = searchParams.get('currency');
  if (currency) raw['currency'] = currency;

  const minRating = searchParams.get('minRating');
  if (minRating && !Number.isNaN(Number(minRating))) raw['minRating'] = parseFloat(minRating);

  const stock = searchParams.get('stock');
  if (stock)
    raw['inventoryStates'] = stock
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const badges = searchParams.get('badges');
  if (badges)
    raw['badgeTypes'] = badges
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const conditions = searchParams.get('conditions');
  if (conditions)
    raw['conditions'] = conditions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const freeShipping = searchParams.get('freeShipping');
  if (freeShipping === 'true' || freeShipping === '1') raw['isFreeShipping'] = true;

  // Extract dynamic attributes (prefixed with attr_)
  const attributeFilters: Record<string, string[]> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('attr_')) {
      const attrKey = key.slice(5);
      attributeFilters[attrKey] = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  });
  if (Object.keys(attributeFilters).length > 0) {
    raw['attributeFilters'] = attributeFilters;
  }

  const sort = searchParams.get('sort');
  if (sort) raw['sort'] = sort;

  const page = searchParams.get('page');
  if (page && !Number.isNaN(Number(page))) raw['page'] = parseInt(page, 10);

  const limit = searchParams.get('limit');
  if (limit && !Number.isNaN(Number(limit))) raw['limit'] = parseInt(limit, 10);

  const cursor = searchParams.get('cursor');
  if (cursor) raw['cursor'] = cursor;

  const locale = searchParams.get('locale');
  if (locale) raw['locale'] = locale;

  const parseResult = CatalogQueryParamsSchema.safeParse(raw);
  return parseResult.success ? parseResult.data : {};
}
