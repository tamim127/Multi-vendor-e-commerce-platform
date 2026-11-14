-- ==============================================================================
-- MIGRATION 002 ROLLBACK: DROP PERFORMANCE & SEARCH INDEXES
-- ==============================================================================

DROP INDEX IF EXISTS idx_products_fulltext_search;
DROP INDEX IF EXISTS idx_order_items_seller_fulfillment;
DROP INDEX IF EXISTS idx_orders_customer_created_desc;
DROP INDEX IF EXISTS idx_products_cat_rating_created;
DROP INDEX IF EXISTS idx_seller_offers_active_buy_box;
DROP INDEX IF EXISTS idx_products_active_only;
