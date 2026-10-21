/**
 * ==============================================================================
 * CATALOG DOMAIN — URL QUERY PARAMETER UTILITIES
 * ==============================================================================
 * Bi-directional type-safe serialization and parsing of catalog search & filter
 * URL state. Validated using CatalogQueryParamsSchema.
 */

import { z } from 'zod';
import { ProductBadgeTypeSchema } from '../schemas/badge.schema';
import { CatalogLocaleSchema, CurrencyCodeSchema } from '../schemas/common.schema';
import { InventoryStateSchema } from '../schemas/inventory.schema';
import { CatalogSortOptionSchema } from '../schemas/query.schema';
import { SellerOfferConditionSchema } from '../schemas/seller-offer.schema';
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
 * Employs tolerant field-level validation: invalid parameters are individually discarded
 * while preserving valid sibling parameters.
 */
export function parseCatalogQueryParams(input: URLSearchParams | string): CatalogQueryParams {
  const searchParams =
    typeof input === 'string'
      ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
      : input;

  const valid: CatalogQueryParams = {};

  const q = searchParams.get('q');
  if (q !== null && q.trim().length > 0) {
    const res = z.string().safeParse(q.trim());
    if (res.success) valid.query = res.data;
  }

  const category = searchParams.get('category');
  if (category) {
    const res = z.string().min(1).safeParse(category.trim());
    if (res.success) valid.categorySlug = res.data;
  }

  const path = searchParams.get('path');
  if (path) {
    const res = z.string().min(1).safeParse(path.trim());
    if (res.success) valid.categoryPath = res.data;
  }

  const categoryId = searchParams.get('categoryId');
  if (categoryId) {
    const res = z.string().min(1).safeParse(categoryId.trim());
    if (res.success) valid.categoryId = res.data;
  }

  const brands = searchParams.get('brands');
  if (brands) {
    const parsedBrands = brands
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedBrands.length > 0) {
      valid.brandSlugs = parsedBrands;
    }
  }

  const sellers = searchParams.get('sellers');
  if (sellers) {
    const parsedSellers = sellers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsedSellers.length > 0) {
      valid.sellerIds = parsedSellers;
    }
  }

  const minPrice = searchParams.get('minPrice');
  if (minPrice !== null && minPrice !== '') {
    const num = Number(minPrice);
    const res = z.number().int().nonnegative().safeParse(num);
    if (res.success) valid.minPriceMinor = res.data;
  }

  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice !== null && maxPrice !== '') {
    const num = Number(maxPrice);
    const res = z.number().int().nonnegative().safeParse(num);
    if (res.success) valid.maxPriceMinor = res.data;
  }

  const currency = searchParams.get('currency');
  if (currency) {
    const res = CurrencyCodeSchema.safeParse(currency.trim());
    if (res.success) valid.currency = res.data;
  }

  const minRating = searchParams.get('minRating');
  if (minRating !== null && minRating !== '') {
    const num = Number(minRating);
    const res = z.number().min(0).max(5).safeParse(num);
    if (res.success) valid.minRating = res.data;
  }

  const stock = searchParams.get('stock');
  if (stock) {
    const parsedStock = stock
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const res = z.array(InventoryStateSchema).safeParse(parsedStock);
    if (res.success && res.data.length > 0) valid.inventoryStates = res.data;
  }

  const badges = searchParams.get('badges');
  if (badges) {
    const parsedBadges = badges
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const res = z.array(ProductBadgeTypeSchema).safeParse(parsedBadges);
    if (res.success && res.data.length > 0) valid.badgeTypes = res.data;
  }

  const conditions = searchParams.get('conditions');
  if (conditions) {
    const parsedConditions = conditions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const res = z.array(SellerOfferConditionSchema).safeParse(parsedConditions);
    if (res.success && res.data.length > 0) valid.conditions = res.data;
  }

  const freeShipping = searchParams.get('freeShipping');
  if (freeShipping === 'true' || freeShipping === '1') {
    valid.isFreeShipping = true;
  }

  // Extract dynamic attributes (prefixed with attr_)
  const attributeFilters: Record<string, string[]> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('attr_')) {
      const attrKey = key.slice(5);
      const items = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (items.length > 0) {
        attributeFilters[attrKey] = items;
      }
    }
  });
  if (Object.keys(attributeFilters).length > 0) {
    valid.attributeFilters = attributeFilters;
  }

  const sort = searchParams.get('sort');
  if (sort) {
    const res = CatalogSortOptionSchema.safeParse(sort.trim());
    if (res.success) valid.sort = res.data;
  }

  const page = searchParams.get('page');
  if (page !== null && page !== '') {
    const num = Number(page);
    const res = z.number().int().positive().safeParse(num);
    if (res.success) valid.page = res.data;
  }

  const limit = searchParams.get('limit');
  if (limit !== null && limit !== '') {
    const num = Number(limit);
    const res = z.number().int().positive().safeParse(num);
    if (res.success) valid.limit = res.data;
  }

  const cursor = searchParams.get('cursor');
  if (cursor) {
    valid.cursor = cursor;
  }

  const locale = searchParams.get('locale');
  if (locale) {
    const res = CatalogLocaleSchema.safeParse(locale.trim());
    if (res.success) valid.locale = res.data;
  }

  return valid;
}
