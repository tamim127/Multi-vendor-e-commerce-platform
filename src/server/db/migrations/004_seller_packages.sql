-- ==============================================================================
-- MIGRATION 004: MULTI-VENDOR SELLER FULFILLMENT PACKAGES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS seller_packages (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    package_number VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    subtotal_minor INT NOT NULL DEFAULT 0,
    shipping_minor INT NOT NULL DEFAULT 0,
    grand_total_minor INT NOT NULL DEFAULT 0,
    carrier VARCHAR(128),
    tracking_number VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_packages_order ON seller_packages(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_packages_seller ON seller_packages(seller_id);
