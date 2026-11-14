-- ==============================================================================
-- MIGRATION 003: COMMERCE INTEGRITY CONSTRAINTS
-- ==============================================================================

-- 1. Ensure Seller Offer stock quantity is never negative
ALTER TABLE seller_offers
    DROP CONSTRAINT IF EXISTS chk_seller_offers_stock_non_negative,
    ADD CONSTRAINT chk_seller_offers_stock_non_negative CHECK (stock_quantity >= 0);

-- 2. Ensure Seller Offer price is strictly positive (> 0 minor units)
ALTER TABLE seller_offers
    DROP CONSTRAINT IF EXISTS chk_seller_offers_price_positive,
    ADD CONSTRAINT chk_seller_offers_price_positive CHECK (price_minor > 0);

-- 3. Ensure Order Item quantity is strictly positive (> 0)
ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS chk_order_items_quantity_positive,
    ADD CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0);

-- 4. Ensure Order grand total amounts are non-negative
ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS chk_orders_total_non_negative,
    ADD CONSTRAINT chk_orders_total_non_negative CHECK (grand_total_minor >= 0);

-- 5. Ensure Unique constraint: one offer per seller per product
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_seller_offers_seller_product'
    ) THEN
        ALTER TABLE seller_offers
        ADD CONSTRAINT uq_seller_offers_seller_product UNIQUE (seller_id, product_id);
    END IF;
END $$;
