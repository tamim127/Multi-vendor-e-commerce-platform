/**
 * ==============================================================================
 * CATALOG DOMAIN — FIXTURES ENTRY POINT
 * ==============================================================================
 * Central export of deterministic development and testing seed fixtures.
 * CRITICAL ARCHITECTURAL NOTICE:
 * All fixture values (prices, stock levels, merchant offers, ratings, buy-box states)
 * are non-authoritative seed data for frontend modeling, validation, and testing.
 * Real marketplace production states are authoritative only via backend services.
 */

export * from './brands.fixture';
export * from './categories.fixture';
export * from './sellers.fixture';
export * from './variants.fixture';
export * from './seller-offers.fixture';
export * from './products.fixture';
export * from './collections.fixture';
