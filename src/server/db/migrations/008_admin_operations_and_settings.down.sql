-- ==============================================================================
-- MIGRATION 008 ROLLBACK
-- ==============================================================================

DROP TABLE IF EXISTS order_timeline_notes CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS return_requests CASCADE;
DROP TABLE IF EXISTS refund_requests CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS seller_applications CASCADE;

ALTER TABLE products
    DROP COLUMN IF EXISTS source_provenance,
    DROP COLUMN IF EXISTS is_spec_verified,
    DROP COLUMN IF EXISTS moderation_reason,
    DROP COLUMN IF EXISTS moderation_status;
