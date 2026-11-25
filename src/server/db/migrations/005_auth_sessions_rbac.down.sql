-- ==============================================================================
-- MIGRATION 005 ROLLBACK
-- ==============================================================================

DROP TABLE IF EXISTS seller_memberships CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP INDEX IF EXISTS idx_customers_email_lower;

ALTER TABLE customers
    DROP COLUMN IF EXISTS last_login_at,
    DROP COLUMN IF EXISTS locked_until,
    DROP COLUMN IF EXISTS failed_login_attempts,
    DROP COLUMN IF EXISTS password_reset_expires_at,
    DROP COLUMN IF EXISTS password_reset_token_hash,
    DROP COLUMN IF EXISTS email_verification_expires_at,
    DROP COLUMN IF EXISTS email_verification_token_hash,
    DROP COLUMN IF EXISTS admin_permissions,
    DROP COLUMN IF EXISTS admin_role,
    DROP COLUMN IF EXISTS role;
