# Aureon Marketplace — Enterprise PostgreSQL Database Architecture

## 1. Architectural Overview

Aureon Multi-Vendor Marketplace utilizes a relational, high-throughput PostgreSQL engine designed for zero data loss, strict transactional atomicity, concurrency-safe inventory allocation, and request-scoped DataLoader batching.

```
+-----------------------------------------------------------------------------------+
|                           Next.js Application Layer                               |
+-----------------------------------------------------------------------------------+
       |                                       |                             |
       v                                       v                             v
[ Catalog Discovery API ]           [ Commerce Order Engine ]       [ Request-Scoped DataLoaders ]
       |                                       |                             |
       +-----------------------+---------------+-----------------------------+
                               |
                               v
               [ Enterprise Connection Pool (pg.Pool) ]
               - Max: 20, Min: 2
               - Connection Timeout: 5,000ms
               - Statement Timeout: 10,000ms
               - Error Sanitization & Slow Query Tracing
                               |
                               v
+-----------------------------------------------------------------------------------+
|                        PostgreSQL 18 Cluster Architecture                         |
+-----------------------------------------------------------------------------------+
| [ Core Relational Schema ]                                                        |
|  - brands (Canonical verified merchants & manufacturers)                          |
|  - categories (Arbitrary depth hierarchy with self-referencing tree parent_id)     |
|  - sellers (Multi-vendor merchant profiles, ratings, tiering)                     |
|  - products (Canonical master catalog records decoupled from vendor pricing)      |
|  - seller_offers (Per-vendor commercial pricing, inventory, Buy Box eligibility)   |
|  - customers & customer_addresses (User accounts and encrypted address books)     |
|  - orders (Root multi-vendor orders with minor-unit currency totals)             |
|  - seller_packages (Fulfillment packages routed to distinct vendors)             |
|  - order_items (Item-level lines bound to packages, products, and sellers)       |
|  - reviews (Customer feedback and verified purchase ratings)                     |
|  - audit_logs (Enterprise immutable security and transactional audit trail)       |
|  - schema_migrations (Version-controlled forward & rollback migration registry)   |
+-----------------------------------------------------------------------------------+
```

## 2. Table Schemas & Foreign Key Relationships

1. **`brands`**: Primary catalog entity for authentic brands (`Apple`, `Sony`, `Samsung`, `Nike`, etc.).
2. **`categories`**: Tree structure via `parent_id REFERENCES categories(id) ON DELETE SET NULL`. Supports unlimited depth.
3. **`sellers`**: Registered merchants selling on the marketplace.
4. **`products`**: Master products with multilingual titles (`title_en`, `title_bn`, `title_ar`, `title_hi`), GIN-indexed tags, full-text search tsvector, and specs JSONB.
5. **`seller_offers`**: Real-time commercial offers with foreign keys to `products(id)` and `sellers(id)`. Constrained with non-negative stock and positive integer prices in minor units.
6. **`orders`**: Root commercial orders capturing subtotal, tax, shipping, and grand total in minor units.
7. **`seller_packages`**: Partitioned fulfillment packages per merchant, ensuring multiple vendors in a single checkout receive separate tracking and dispatch lifecycles.
8. **`order_items`**: Line items linked to orders, packages, products, and sellers.
9. **`audit_logs`**: Immutable append-only audit trail logging actors, roles, actions, and metadata.
10. **`schema_migrations`**: Migration ledger tracking SHA-256 checksums, execution duration, and versions.

## 3. High-Performance Indexing Strategy

- **Partial Indexes**:
  - `idx_products_active_only`: `ON products(id, category_id, brand_id) WHERE is_active = true`
  - `idx_seller_offers_active_buy_box`: `ON seller_offers(product_id, price_minor, stock_quantity) WHERE inventory_state = 'in_stock' AND is_buy_box_winner = true`
- **Composite Indexes**:
  - `idx_products_cat_rating_created`: `ON products(category_id, rating_avg DESC, created_at DESC)`
  - `idx_orders_customer_created_desc`: `ON orders(customer_id, created_at DESC)`
  - `idx_order_items_seller_fulfillment`: `ON order_items(seller_id, order_id, product_id)`
- **GIN & Search Indexes**:
  - `idx_products_tags`: `USING gin(tags)`
  - `idx_products_specs`: `USING gin(specifications)`
  - `idx_products_fulltext_search`: `USING gin(to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(description_en, '')))`

## 4. Transaction Safety & Concurrency Control

- **Pessimistic Concurrency Control**: During checkout, inventory rows are locked using `SELECT ... FOR UPDATE` within a database transaction.
- **Stock Depletion Prevention**: If requested quantity exceeds `stock_quantity`, an explicit `InsufficientStockError` is thrown, triggering a complete transaction `ROLLBACK`.
- **Zero Partial Orders**: No orders or seller packages can ever be created without successful inventory decrement.
