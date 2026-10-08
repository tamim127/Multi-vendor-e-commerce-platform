/**
 * ==============================================================================
 * CATALOG DOMAIN — API ENDPOINTS SPECIFICATION
 * ==============================================================================
 * Declarative route contracts for future BFF and backend REST/OpenAPI services.
 */

export const CATALOG_API_ROUTES = {
  /** List products with filtering, faceted search, and dual pagination */
  getProducts: '/catalog/products',
  /** Retrieve canonical product by unique slug */
  getProductBySlug: (slug: string): string => `/catalog/products/${encodeURIComponent(slug)}`,
  /** List category tree or flat list */
  getCategories: '/catalog/categories',
  /** Retrieve category details and breadcrumb lineage by slug */
  getCategoryBySlug: (slug: string): string => `/catalog/categories/${encodeURIComponent(slug)}`,
  /** List marketplace brands */
  getBrands: '/catalog/brands',
  /** List curated marketplace collections */
  getCollections: '/catalog/collections',
  /** Retrieve all active multi-vendor seller offers for a product/variant */
  getProductSellerOffers: (productId: string): string =>
    `/catalog/products/${encodeURIComponent(productId)}/seller-offers`,
} as const;
