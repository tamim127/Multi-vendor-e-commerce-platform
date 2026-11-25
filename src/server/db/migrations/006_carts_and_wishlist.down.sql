-- ==============================================================================
-- MIGRATION 006 ROLLBACK
-- ==============================================================================

DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
