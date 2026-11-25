-- ==============================================================================
-- MIGRATION 008: SELLER APPLICATIONS, ADMIN OPERATIONS & PLATFORM SETTINGS
-- ==============================================================================

-- 1. Product moderation & verification tracking
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(32) NOT NULL DEFAULT 'approved',
    ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
    ADD COLUMN IF NOT EXISTS is_spec_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS source_provenance VARCHAR(64) NOT NULL DEFAULT 'catalog_importer';

-- 2. Seller Onboarding Applications
CREATE TABLE IF NOT EXISTS seller_applications (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    seller_id VARCHAR(64) REFERENCES sellers(id) ON DELETE SET NULL,
    store_name VARCHAR(255) NOT NULL,
    store_slug VARCHAR(255) NOT NULL,
    store_description TEXT NOT NULL,
    business_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'under_review',
    reviewer_id VARCHAR(64),
    reviewer_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_seller_apps_status ON seller_applications(status);

-- 3. Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    discount_type VARCHAR(32) NOT NULL DEFAULT 'percentage',
    discount_value INT NOT NULL CHECK (discount_value >= 0),
    min_order_minor INT NOT NULL DEFAULT 0,
    max_discount_minor INT,
    usage_limit INT,
    current_usage_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Promotions
CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    banner_text VARCHAR(255),
    discount_percentage INT NOT NULL DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
    target_category_id VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Refund Requests (Explicit gateway pending state when no external processor is wired)
CREATE TABLE IF NOT EXISTS refund_requests (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL,
    amount_minor INT NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    payment_gateway_status VARCHAR(64) NOT NULL DEFAULT 'pending_gateway_integration',
    admin_note TEXT,
    reviewed_by VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_order ON refund_requests(order_id);

-- 6. Return Requests
CREATE TABLE IF NOT EXISTS return_requests (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    items_summary TEXT NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'requested',
    admin_note TEXT,
    reviewed_by VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);

-- 7. Platform Settings (Singleton configuration row)
CREATE TABLE IF NOT EXISTS platform_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
    marketplace_name VARCHAR(255) NOT NULL DEFAULT 'Aureon Global Marketplace',
    support_email VARCHAR(255) NOT NULL DEFAULT 'support@aureon.market',
    default_currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    platform_commission_bps INT NOT NULL DEFAULT 1200,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    allow_seller_registrations BOOLEAN NOT NULL DEFAULT TRUE,
    require_product_moderation BOOLEAN NOT NULL DEFAULT TRUE,
    settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by VARCHAR(64),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 8. Admin Notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    target_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Order Timeline Notes
CREATE TABLE IF NOT EXISTS order_timeline_notes (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_notes_order ON order_timeline_notes(order_id, created_at DESC);
