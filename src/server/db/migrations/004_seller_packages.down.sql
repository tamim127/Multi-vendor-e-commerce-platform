-- ==============================================================================
-- MIGRATION 004 ROLLBACK: DROP SELLER PACKAGES
-- ==============================================================================

DROP TABLE IF EXISTS seller_packages CASCADE;
