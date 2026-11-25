-- ==============================================================================
-- MIGRATION 006: PERSISTENT CARTS & WISHLISTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    guest_token_hash VARCHAR(128) UNIQUE,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_owner CHECK (customer_id IS NOT NULL OR guest_token_hash IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_active_customer
    ON carts(customer_id)
    WHERE customer_id IS NOT NULL AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_carts_guest_token ON carts(guest_token_hash) WHERE guest_token_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(64) PRIMARY KEY,
    cart_id VARCHAR(64) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    offer_id VARCHAR(64) NOT NULL REFERENCES seller_offers(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    variant_id VARCHAR(128) NOT NULL DEFAULT 'default',
    variant_label VARCHAR(255),
    quantity INT NOT NULL CHECK (quantity > 0 AND quantity <= 99),
    unit_price_minor INT NOT NULL CHECK (unit_price_minor >= 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_offer_variant UNIQUE (cart_id, offer_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_offer ON cart_items(offer_id);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_wishlist_customer_product UNIQUE (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlist_items(customer_id, created_at DESC);
