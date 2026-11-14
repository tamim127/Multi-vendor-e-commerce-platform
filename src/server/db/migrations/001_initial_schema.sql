-- ==============================================================================
-- MIGRATION 001: INITIAL RELATIONAL SCHEMA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    country VARCHAR(8) DEFAULT 'US',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_verified ON brands(is_verified);

-- 2. CATEGORIES (Unlimited depth tree hierarchy)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    parent_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255),
    name_ar VARCHAR(255),
    name_hi VARCHAR(255),
    level INT NOT NULL DEFAULT 0,
    icon VARCHAR(64),
    banner_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- 3. SELLERS (Multi-Vendor Merchant Registry)
CREATE TABLE IF NOT EXISTS sellers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    tier VARCHAR(32) NOT NULL DEFAULT 'standard',
    status VARCHAR(32) NOT NULL DEFAULT 'pending_review',
    is_verified BOOLEAN DEFAULT FALSE,
    rating_avg NUMERIC(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    positive_feedback_pct NUMERIC(5, 2) DEFAULT 100.00,
    logo_url TEXT,
    banner_url TEXT,
    tagline TEXT,
    description TEXT,
    business_legal_name VARCHAR(255),
    tax_id VARCHAR(64),
    registration_number VARCHAR(64),
    country VARCHAR(8) DEFAULT 'US',
    contact_phone VARCHAR(64),
    payout_account_id VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sellers_slug ON sellers(slug);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_sellers_tier ON sellers(tier);
CREATE INDEX IF NOT EXISTS idx_sellers_rating ON sellers(rating_avg DESC);

-- 4. PRODUCTS (Canonical Catalog Entities)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(128) NOT NULL UNIQUE,
    category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    brand_id VARCHAR(64) NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    title_en VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255),
    title_ar VARCHAR(255),
    title_hi VARCHAR(255),
    description_en TEXT NOT NULL,
    description_bn TEXT,
    description_ar TEXT,
    description_hi TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    primary_image_url TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    rating_avg NUMERIC(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_specs ON products USING GIN(specifications);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- 5. SELLER OFFERS
CREATE TABLE IF NOT EXISTS seller_offers (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    sku VARCHAR(128) NOT NULL,
    price_minor INT NOT NULL CHECK (price_minor >= 0),
    compare_at_price_minor INT CHECK (compare_at_price_minor >= price_minor),
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    inventory_state VARCHAR(32) NOT NULL DEFAULT 'in_stock',
    condition VARCHAR(32) NOT NULL DEFAULT 'new',
    fulfillment_type VARCHAR(32) NOT NULL DEFAULT 'marketplace_fulfilled',
    is_buy_box_winner BOOLEAN DEFAULT FALSE,
    min_delivery_days INT DEFAULT 3,
    max_delivery_days INT DEFAULT 5,
    is_free_shipping BOOLEAN DEFAULT TRUE,
    shipping_cost_minor INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_product_seller UNIQUE (product_id, seller_id, condition)
);

CREATE INDEX IF NOT EXISTS idx_offers_product ON seller_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON seller_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_price ON seller_offers(price_minor);
CREATE INDEX IF NOT EXISTS idx_offers_buybox ON seller_offers(product_id, is_buy_box_winner);
CREATE INDEX IF NOT EXISTS idx_offers_stock ON seller_offers(stock_quantity);

-- 6. CUSTOMERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    phone VARCHAR(64),
    avatar_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{"language":"en","currency":"USD"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 7. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS customer_addresses (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    label VARCHAR(32) NOT NULL DEFAULT 'home',
    full_name VARCHAR(255) NOT NULL,
    street_line1 TEXT NOT NULL,
    street_line2 TEXT,
    city VARCHAR(128) NOT NULL,
    state_province VARCHAR(128) NOT NULL,
    postal_code VARCHAR(32) NOT NULL,
    country_code VARCHAR(8) NOT NULL DEFAULT 'US',
    phone VARCHAR(64) NOT NULL,
    is_default_shipping BOOLEAN DEFAULT FALSE,
    is_default_billing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    items_subtotal_minor INT NOT NULL CHECK (items_subtotal_minor >= 0),
    shipping_total_minor INT NOT NULL DEFAULT 0,
    tax_total_minor INT NOT NULL DEFAULT 0,
    grand_total_minor INT NOT NULL CHECK (grand_total_minor >= 0),
    item_count INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(64) NOT NULL DEFAULT 'credit_card',
    escrow_reference VARCHAR(128),
    escrow_status VARCHAR(32) DEFAULT 'held',
    carrier VARCHAR(128),
    tracking_number VARCHAR(128),
    estimated_delivery VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    sku VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    unit_price_minor INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total_minor INT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    fulfillment_status VARCHAR(32) DEFAULT 'pending',
    carrier VARCHAR(128),
    tracking_number VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- 10. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    status VARCHAR(32) DEFAULT 'approved',
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    outcome VARCHAR(32) NOT NULL DEFAULT 'success',
    ip_address VARCHAR(64),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
