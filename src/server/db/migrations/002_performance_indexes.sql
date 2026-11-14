-- ==============================================================================
-- MIGRATION 002: PRODUCTION PERFORMANCE & SEARCH INDEXES
-- ==============================================================================

-- 1. Partial Index for Active Products (Query speedup for catalog views)
CREATE INDEX IF NOT EXISTS idx_products_active_only
ON products(id, category_id, brand_id)
WHERE is_active = true;

-- 2. Partial Index for Active Buy-Box Winning Seller Offers
CREATE INDEX IF NOT EXISTS idx_seller_offers_active_buy_box
ON seller_offers(product_id, price_minor, stock_quantity)
WHERE inventory_state = 'in_stock' AND is_buy_box_winner = true;

-- 3. Composite Index for Category Browsing with Rating and Date Sorting
CREATE INDEX IF NOT EXISTS idx_products_cat_rating_created
ON products(category_id, rating_avg DESC, created_at DESC);

-- 4. Composite Index for Customer Order History Lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_created_desc
ON orders(customer_id, created_at DESC);

-- 5. Composite Index for Seller Package & Item Fulfillment
CREATE INDEX IF NOT EXISTS idx_order_items_seller_fulfillment
ON order_items(seller_id, order_id, product_id);

-- 6. Full-Text Search GIN Index for High-Throughput Catalog Search
CREATE INDEX IF NOT EXISTS idx_products_fulltext_search
ON products USING gin(to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(description_en, '')));
