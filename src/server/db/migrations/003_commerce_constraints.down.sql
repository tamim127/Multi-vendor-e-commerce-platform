-- ==============================================================================
-- MIGRATION 003 ROLLBACK: DROP COMMERCE INTEGRITY CONSTRAINTS
-- ==============================================================================

ALTER TABLE seller_offers DROP CONSTRAINT IF EXISTS uq_seller_offers_seller_product;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_total_non_negative;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_quantity_positive;
ALTER TABLE seller_offers DROP CONSTRAINT IF EXISTS chk_seller_offers_price_positive;
ALTER TABLE seller_offers DROP CONSTRAINT IF EXISTS chk_seller_offers_stock_non_negative;
