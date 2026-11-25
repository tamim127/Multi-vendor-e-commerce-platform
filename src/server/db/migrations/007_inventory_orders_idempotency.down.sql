-- ==============================================================================
-- MIGRATION 007 ROLLBACK
-- ==============================================================================

DROP TABLE IF EXISTS idempotency_records CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory_reservations CASCADE;

ALTER TABLE order_items
    DROP COLUMN IF EXISTS variant_id,
    DROP COLUMN IF EXISTS offer_id,
    DROP COLUMN IF EXISTS package_id;

ALTER TABLE seller_packages
    DROP COLUMN IF EXISTS delivered_at,
    DROP COLUMN IF EXISTS dispatched_at,
    DROP COLUMN IF EXISTS fulfillment_status;

ALTER TABLE orders
    DROP COLUMN IF EXISTS delivery_method,
    DROP COLUMN IF EXISTS idempotency_key,
    DROP COLUMN IF EXISTS fulfillment_status,
    DROP COLUMN IF EXISTS payment_status;

ALTER TABLE seller_offers
    DROP CONSTRAINT IF EXISTS chk_seller_offers_reserved_le_stock,
    DROP COLUMN IF EXISTS reserved_quantity;
