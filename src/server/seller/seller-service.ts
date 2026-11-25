import crypto from 'node:crypto';
import type pg from 'pg';
import { dbQuery, getDbPool, withTransaction } from '@/server/db/client';
import { adjustSellerOfferStock } from '@/server/commerce/inventory-service';
import { transitionSellerPackageLifecycle, type PackageLifecycleStatus } from '@/server/commerce/order-lifecycle';
import { createMoney } from '@/domains/catalog/utils/money';
import { NotFoundError, ValidationError } from '@/server/security/http';

export async function getSellerProfile(sellerId: string, pool?: pg.Pool): Promise<Record<string, any>> {
  const res = await dbQuery<any>('SELECT * FROM sellers WHERE id = $1 LIMIT 1;', [sellerId], pool);
  if (res.rows.length === 0) {
    throw new NotFoundError('Seller store not found.');
  }
  const s = res.rows[0];
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    email: s.email,
    tier: s.tier,
    status: s.status,
    isVerified: Boolean(s.is_verified),
    rating: {
      average: Number(s.rating_avg || 0),
      count: Number(s.rating_count || 0),
      positiveFeedbackPercent: Number(s.positive_feedback_pct || 100),
    },
    tagline: s.tagline || '',
    description: s.description || '',
    businessLegalName: s.business_legal_name || s.name,
    taxId: s.tax_id || '',
    registrationNumber: s.registration_number || '',
    country: s.country || 'US',
    contactPhone: s.contact_phone || '',
    updatedAt: s.updated_at ? new Date(s.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function updateSellerProfile(
  sellerId: string,
  actorId: string,
  input: { name?: string; tagline?: string; description?: string; contactPhone?: string; logoUrl?: string; bannerUrl?: string },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      const existing = await client.query('SELECT * FROM sellers WHERE id = $1 FOR UPDATE;', [sellerId]);
      if (existing.rows.length === 0) throw new NotFoundError('Seller not found.');
      const cur = existing.rows[0];

      const res = await client.query(
        `UPDATE sellers
         SET name = $2, tagline = $3, description = $4, contact_phone = $5,
             logo_url = $6, banner_url = $7, updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [
          sellerId,
          input.name?.trim() || cur.name,
          input.tagline ?? cur.tagline,
          input.description ?? cur.description,
          input.contactPhone ?? cur.contact_phone,
          input.logoUrl ?? cur.logo_url,
          input.bannerUrl ?? cur.banner_url,
        ]
      );

      await client.query(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, outcome)
         VALUES ($1, $2, $2, 'seller', 'SELLER_PROFILE_UPDATED', 'seller', $3, 'success');`,
        [`aud-${crypto.randomUUID().slice(0, 12)}`, actorId, sellerId]
      );

      return res.rows[0];
    },
    undefined,
    pool
  );
}

/**
 * Submits a real onboarding application for an authenticated user and registers pending store + membership.
 */
export async function submitSellerOnboardingApplication(
  customerId: string,
  input: {
    storeName: string;
    storeSlug: string;
    storeDescription: string;
    businessInfo: Record<string, unknown>;
    contactEmail: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      const sellerId = `seller-${input.storeSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${crypto.randomUUID().slice(0, 4)}`;
      const appId = `app-${crypto.randomUUID().slice(0, 12)}`;

      await client.query(
        `INSERT INTO sellers (
           id, name, slug, email, tier, status, is_verified, description, business_legal_name
         ) VALUES ($1, $2, $3, $4, 'standard', 'pending_review', false, $5, $6);`,
        [
          sellerId,
          input.storeName.trim(),
          input.storeSlug.trim().toLowerCase(),
          input.contactEmail.trim().toLowerCase(),
          input.storeDescription.trim(),
          String(input.businessInfo?.['legalName'] || input.storeName),
        ]
      );

      await client.query(
        `INSERT INTO seller_memberships (id, customer_id, seller_id, membership_role, status)
         VALUES ($1, $2, $3, 'owner', 'active');`,
        [`sm-${crypto.randomUUID().slice(0, 12)}`, customerId, sellerId]
      );

      await client.query(
        `UPDATE customers SET role = CASE WHEN role = 'admin' THEN role ELSE 'seller' END, updated_at = NOW() WHERE id = $1;`,
        [customerId]
      );

      const appRes = await client.query(
        `INSERT INTO seller_applications (
           id, customer_id, seller_id, store_name, store_slug, store_description, business_info, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'under_review')
         RETURNING *;`,
        [
          appId,
          customerId,
          sellerId,
          input.storeName.trim(),
          input.storeSlug.trim().toLowerCase(),
          input.storeDescription.trim(),
          JSON.stringify(input.businessInfo || {}),
        ]
      );

      await client.query(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, outcome)
         VALUES ($1, $2, $2, 'customer', 'SELLER_APPLICATION_SUBMITTED', 'seller', $3, 'success');`,
        [`aud-${crypto.randomUUID().slice(0, 12)}`, customerId, sellerId]
      );

      return appRes.rows[0];
    },
    undefined,
    pool
  );
}

/**
 * Lists all product offers strictly owned by the seller.
 */
export async function listSellerOffers(sellerId: string, pool?: pg.Pool): Promise<Array<Record<string, any>>> {
  const res = await dbQuery<any>(
    `SELECT so.*, p.title_en, p.slug AS product_slug, p.primary_image_url, p.moderation_status
     FROM seller_offers so
     JOIN products p ON p.id = so.product_id
     WHERE so.seller_id = $1
     ORDER BY so.updated_at DESC;`,
    [sellerId],
    pool
  );

  return res.rows.map((r) => ({
    offerId: r.id,
    productId: r.product_id,
    sellerId: r.seller_id,
    sku: r.sku,
    title: r.title_en,
    slug: r.product_slug,
    thumbnail: r.primary_image_url || '',
    price: createMoney(Number(r.price_minor), (r.currency || 'USD') as any),
    compareAtPrice: r.compare_at_price_minor
      ? createMoney(Number(r.compare_at_price_minor), (r.currency || 'USD') as any)
      : undefined,
    inventory: {
      state: r.inventory_state,
      quantityAvailable: Math.max(0, Number(r.stock_quantity) - Number(r.reserved_quantity || 0)),
      physicalStock: Number(r.stock_quantity),
      reservedStock: Number(r.reserved_quantity || 0),
    },
    isBuyBoxWinner: Boolean(r.is_buy_box_winner),
    moderationStatus: r.moderation_status,
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

/**
 * Creates a seller product + offer atomically in PostgreSQL (pending catalog moderation unless authorized).
 */
export async function createSellerOfferListing(
  sellerId: string,
  actorId: string,
  input: {
    productId?: string;
    title: string;
    sku: string;
    priceMinor: number;
    compareAtPriceMinor?: number;
    currency?: string;
    stockQuantity: number;
    categoryId?: string;
    description?: string;
    imageUrl?: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      let productId = input.productId;
      if (!productId) {
        productId = `prod-${crypto.randomUUID().slice(0, 12)}`;
        const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)}-${productId.slice(-6)}`;
        // Resolve fallback category and brand if omitted
        const catRes = await client.query<{ id: string }>(
          input.categoryId
            ? 'SELECT id FROM categories WHERE id = $1 LIMIT 1;'
            : 'SELECT id FROM categories LIMIT 1;',
          input.categoryId ? [input.categoryId] : []
        );
        const brandRes = await client.query<{ id: string }>('SELECT id FROM brands LIMIT 1;');

        if (catRes.rows.length === 0 || brandRes.rows.length === 0) {
          throw new ValidationError('Catalog reference categories/brands must exist before creating listings.');
        }

        await client.query(
          `INSERT INTO products (
             id, slug, sku, category_id, brand_id, title_en, description_en,
             primary_image_url, is_active, moderation_status, source_provenance
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'pending_review', 'seller_portal');`,
          [
            productId,
            slug,
            input.sku,
            catRes.rows[0]!.id,
            brandRes.rows[0]!.id,
            input.title.trim(),
            input.description?.trim() || `${input.title.trim()} listing submitted by merchant.`,
            input.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          ]
        );
      }

      const offerId = `ofr-${crypto.randomUUID().slice(0, 12)}`;
      const currency = input.currency || 'USD';
      const stock = Math.max(0, Math.trunc(input.stockQuantity));

      const offerRes = await client.query(
        `INSERT INTO seller_offers (
           id, product_id, seller_id, sku, price_minor, compare_at_price_minor, currency,
           stock_quantity, reserved_quantity, inventory_state, is_buy_box_winner
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, false)
         RETURNING *;`,
        [
          offerId,
          productId,
          sellerId,
          input.sku,
          input.priceMinor,
          input.compareAtPriceMinor || null,
          currency,
          stock,
          stock > 0 ? 'in_stock' : 'out_of_stock',
        ]
      );

      await client.query(
        `INSERT INTO inventory_movements (
           id, offer_id, actor_id, movement_type, quantity_delta,
           stock_before, stock_after, reserved_before, reserved_after, reason
         ) VALUES ($1, $2, $3, 'ADJUST', $4, 0, $4, 0, 0, 'Initial seller offer stock');`,
        [`mov-${crypto.randomUUID().slice(0, 12)}`, offerId, actorId, stock]
      );

      return offerRes.rows[0];
    },
    undefined,
    pool
  );
}

export async function listSellerPackages(
  sellerId: string,
  filters?: { status?: string; q?: string },
  pool?: pg.Pool
): Promise<Array<Record<string, any>>> {
  const targetPool = pool || getDbPool();
  const conditions = ['sp.seller_id = $1'];
  const values: any[] = [sellerId];
  let idx = 2;

  if (filters?.status && filters.status !== 'all') {
    conditions.push(`sp.status = $${idx}`);
    values.push(filters.status);
    idx++;
  }

  if (filters?.q) {
    conditions.push(`(sp.order_id ILIKE $${idx} OR sp.id ILIKE $${idx} OR sp.package_number ILIKE $${idx})`);
    values.push(`%${filters.q}%`);
    idx++;
  }

  const res = await targetPool.query(
    `SELECT sp.*, o.shipping_address, o.currency, o.created_at AS order_created_at
     FROM seller_packages sp
     JOIN orders o ON o.id = sp.order_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY sp.created_at DESC;`,
    values
  );

  const itemsRes =
    res.rows.length > 0
      ? await targetPool.query(
          `SELECT * FROM order_items WHERE seller_id = $1 AND order_id = ANY($2);`,
          [sellerId, res.rows.map((r) => r.order_id)]
        )
      : { rows: [] };

  return res.rows.map((pkg) => {
    const addr = typeof pkg.shipping_address === 'object' && pkg.shipping_address ? pkg.shipping_address : {};
    const pkgItems = itemsRes.rows.filter((i) => i.order_id === pkg.order_id);

    return {
      packageId: pkg.id,
      orderId: pkg.order_id,
      packageNumber: pkg.package_number,
      status: pkg.status,
      fulfillmentStatus: pkg.fulfillment_status || pkg.status,
      carrier: pkg.carrier || undefined,
      trackingNumber: pkg.tracking_number || undefined,
      dispatchedAt: pkg.dispatched_at ? new Date(pkg.dispatched_at).toISOString() : undefined,
      deliveredAt: pkg.delivered_at ? new Date(pkg.delivered_at).toISOString() : undefined,
      customer: {
        name: addr.name || addr.fullName || 'Verified Buyer',
        city: addr.city || '',
        country: addr.country || 'US',
      },
      subtotal: createMoney(Number(pkg.subtotal_minor || 0), (pkg.currency || 'USD') as any),
      grandTotal: createMoney(Number(pkg.grand_total_minor || 0), (pkg.currency || 'USD') as any),
      items: pkgItems.map((it) => ({
        id: it.id,
        productId: it.product_id,
        sku: it.sku,
        title: it.title,
        quantity: Number(it.quantity),
        unitPrice: createMoney(Number(it.unit_price_minor), (it.currency || 'USD') as any),
        lineTotal: createMoney(Number(it.line_total_minor), (it.currency || 'USD') as any),
      })),
      createdAt: new Date(pkg.created_at).toISOString(),
    };
  });
}

export async function dispatchPackageForSeller(
  params: {
    packageId: string;
    sellerId: string;
    status: PackageLifecycleStatus;
    carrier?: string;
    trackingNumber?: string;
    actorId: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return transitionSellerPackageLifecycle(
    {
      packageId: params.packageId,
      sellerId: params.sellerId,
      targetStatus: params.status,
      carrier: params.carrier,
      trackingNumber: params.trackingNumber,
      actorId: params.actorId,
    },
    pool
  );
}

export async function adjustSellerInventory(
  params: {
    offerId: string;
    sellerId: string;
    actorId: string;
    delta: number;
    reason: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return adjustSellerOfferStock(params, pool);
}

/**
 * Computes real SQL-derived analytics strictly from database records belonging to the seller.
 */
export async function getSellerRealAnalytics(
  sellerId: string,
  timeframe: string,
  pool?: pg.Pool
): Promise<Record<string, any>> {
  const targetPool = pool || getDbPool();
  const intervalClause =
    timeframe === 'last_7_days'
      ? "NOW() - INTERVAL '7 days'"
      : timeframe === 'last_quarter'
        ? "NOW() - INTERVAL '90 days'"
        : "NOW() - INTERVAL '30 days'";

  const [kpiRes, offersCountRes, trendRes] = await Promise.all([
    targetPool.query(
      `SELECT
         COALESCE(SUM(sp.grand_total_minor) FILTER (WHERE sp.status != 'cancelled'), 0) AS revenue_minor,
         COUNT(DISTINCT sp.id) AS total_packages,
         COUNT(DISTINCT sp.id) FILTER (WHERE sp.status = 'pending') AS pending_packages,
         COUNT(DISTINCT sp.id) FILTER (WHERE sp.status = 'shipped' OR sp.status = 'delivered') AS fulfilled_packages
       FROM seller_packages sp
       WHERE sp.seller_id = $1 AND sp.created_at >= ${intervalClause};`,
      [sellerId]
    ),
    targetPool.query(
      `SELECT
         COUNT(*) AS active_offers,
         COUNT(*) FILTER (WHERE (stock_quantity - COALESCE(reserved_quantity, 0)) <= 5) AS low_stock_offers,
         COUNT(*) FILTER (WHERE is_buy_box_winner = true) AS buy_box_wins
       FROM seller_offers
       WHERE seller_id = $1;`,
      [sellerId]
    ),
    targetPool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS day,
         COALESCE(SUM(grand_total_minor) FILTER (WHERE status != 'cancelled'), 0) AS revenue_minor,
         COUNT(*) AS orders_count
       FROM seller_packages
       WHERE seller_id = $1 AND created_at >= ${intervalClause}
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY day ASC;`,
      [sellerId]
    ),
  ]);

  const k = kpiRes.rows[0] || {};
  const o = offersCountRes.rows[0] || {};
  const revenueMinor = parseInt(k.revenue_minor || '0', 10);

  return {
    timeframe,
    revenue: createMoney(revenueMinor, 'USD'),
    totalOrders: parseInt(k.total_packages || '0', 10),
    pendingFulfillment: parseInt(k.pending_packages || '0', 10),
    fulfilledPackages: parseInt(k.fulfilled_packages || '0', 10),
    activeListings: parseInt(o.active_offers || '0', 10),
    lowStockCount: parseInt(o.low_stock_offers || '0', 10),
    buyBoxWins: parseInt(o.buy_box_wins || '0', 10),
    dailyTrends: trendRes.rows.map((r) => ({
      date: r.day,
      revenueMinor: parseInt(r.revenue_minor || '0', 10),
      ordersCount: parseInt(r.orders_count || '0', 10),
    })),
  };
}
