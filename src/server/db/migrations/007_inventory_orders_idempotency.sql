-- ==============================================================================
-- MIGRATION 007: INVENTORY RESERVATIONS, ORDER LIFECYCLE & DURABLE IDEMPOTENCY
-- ==============================================================================

-- 1. Inventory reservation accounting columns on seller_offers
-- Invariant: stock_quantity = physical on-hand stock, reserved_quantity = pending/held stock,
-- available = stock_quantity - reserved_quantity >= 0
ALTER TABLE seller_offers
    ADD COLUMN IF NOT EXISTS reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0);

ALTER TABLE seller_offers
    DROP CONSTRAINT IF EXISTS chk_seller_offers_reserved_le_stock,
    ADD CONSTRAINT chk_seller_offers_reserved_le_stock CHECK (reserved_quantity <= stock_quantity);

-- 2. Inventory Reservations table with expiration support
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id VARCHAR(64) PRIMARY KEY,
    offer_id VARCHAR(64) NOT NULL REFERENCES seller_offers(id) ON DELETE CASCADE,
    order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'reserved',
    expires_at TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_res_offer_status ON inventory_reservations(offer_id, status);
CREATE INDEX IF NOT EXISTS idx_inv_res_order ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inv_res_expires ON inventory_reservations(expires_at) WHERE status = 'reserved';

-- 3. Inventory Movement Audit Ledger
CREATE TABLE IF NOT EXISTS inventory_movements (
    id VARCHAR(64) PRIMARY KEY,
    offer_id VARCHAR(64) NOT NULL REFERENCES seller_offers(id) ON DELETE CASCADE,
    order_id VARCHAR(64),
    actor_id VARCHAR(64) NOT NULL,
    movement_type VARCHAR(32) NOT NULL,
    quantity_delta INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    reserved_before INT NOT NULL,
    reserved_after INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_movements_offer ON inventory_movements(offer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_movements_order ON inventory_movements(order_id);

-- 4. Order lifecycle separation (payment_status, fulfillment_status, idempotency_key)
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) NOT NULL DEFAULT 'pending_payment',
    ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(32) NOT NULL DEFAULT 'unfulfilled',
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128),
    ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(32) NOT NULL DEFAULT 'standard';

ALTER TABLE seller_packages
    ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS package_id VARCHAR(64) REFERENCES seller_packages(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS offer_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS variant_id VARCHAR(128);

-- 5. Order & Package Transition History
CREATE TABLE IF NOT EXISTS order_status_history (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    package_id VARCHAR(64) REFERENCES seller_packages(id) ON DELETE CASCADE,
    scope VARCHAR(32) NOT NULL DEFAULT 'order',
    previous_status VARCHAR(64),
    new_status VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id, created_at DESC);

-- 6. Durable Scoped Idempotency Records
CREATE TABLE IF NOT EXISTS idempotency_records (
    id VARCHAR(64) PRIMARY KEY,
    scope VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL,
    payload_hash VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    status_code INT,
    response_body JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_idempotency_scope_key UNIQUE (scope, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_records(expires_at);
