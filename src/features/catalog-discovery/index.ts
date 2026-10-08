/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — BARREL EXPORT
 * ==============================================================================
 * Central export of the Catalog Discovery / PLP feature module.
 * CRITICAL ARCHITECTURAL RULE:
 * PlpProductItem is strictly an internal presentation detail and is NOT exported
 * to preserve Phase 2C (Reusable Product Card System) boundaries.
 */

export * from './repository';
export * from './hooks/use-product-discovery';
export * from './hooks/use-catalog-url-state';
export * from './components/product-discovery-page';
