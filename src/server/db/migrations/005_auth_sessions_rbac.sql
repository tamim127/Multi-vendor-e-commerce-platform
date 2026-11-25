-- ==============================================================================
-- MIGRATION 005: PRODUCTION IDENTITY, SESSIONS, RBAC & SELLER MEMBERSHIPS
-- ==============================================================================

-- Reconcile customers as the unified identity table with role, security lockout, and token lifecycle
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'customer',
    ADD COLUMN IF NOT EXISTS admin_role VARCHAR(64),
    ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS email_verification_token_hash VARCHAR(128),
    ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS password_reset_token_hash VARCHAR(128),
    ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Normalize email uniqueness case-insensitively
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower ON customers (LOWER(email));

-- Database-backed session persistence (tokens stored as SHA-256 hashes at rest)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    csrf_token_hash VARCHAR(128) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(64),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason VARCHAR(128),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_customer ON user_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Multi-tenant merchant membership binding authenticated accounts to sellers
CREATE TABLE IF NOT EXISTS seller_memberships (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    membership_role VARCHAR(32) NOT NULL DEFAULT 'owner',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_customer_seller_membership UNIQUE (customer_id, seller_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_memberships_customer ON seller_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_seller_memberships_seller ON seller_memberships(seller_id);
