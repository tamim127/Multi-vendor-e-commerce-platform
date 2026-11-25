import crypto from 'node:crypto';
import type pg from 'pg';
import { checkDatabaseHealth, dbQuery, getDbPool, withTransaction } from '@/server/db/client';
import { transitionOrderLifecycle, type OrderLifecycleStatus } from '@/server/commerce/order-lifecycle';
import { createMoney } from '@/domains/catalog/utils/money';
import { NotFoundError, ValidationError } from '@/server/security/http';

export async function recordAdminAuditLog(
  client: pg.Pool | pg.PoolClient,
  params: {
    actorId: string;
    actorName: string;
    actorRole: string;
    action: string;
    targetType: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
    outcome?: 'success' | 'failure' | 'denied';
  }
): Promise<void> {
  await client.query(
    `INSERT INTO audit_logs (
       id, timestamp, actor_id, actor_name, actor_role,
       action, target_type, target_id, metadata, outcome
     ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9);`,
    [
      `aud-${crypto.randomUUID().slice(0, 12)}`,
      params.actorId,
      params.actorName,
      params.actorRole,
      params.action,
      params.targetType,
      params.targetId || null,
      JSON.stringify(params.metadata || {}),
      params.outcome || 'success',
    ]
  );
}

/**
 * Computes real platform KPIs directly from PostgreSQL tables.
 */
export async function getAdminRealMetrics(timeframe: string, pool?: pg.Pool): Promise<Record<string, any>> {
  const targetPool = pool || getDbPool();
  const intervalClause =
    timeframe === 'last_7_days'
      ? "NOW() - INTERVAL '7 days'"
      : timeframe === 'last_quarter'
        ? "NOW() - INTERVAL '90 days'"
        : "NOW() - INTERVAL '30 days'";

  const [ordersAgg, entitiesAgg, revenueTrendRes, topSellersRes, topProductsRes, dbHealth] =
    await Promise.all([
      targetPool.query(
        `SELECT
           COALESCE(SUM(grand_total_minor) FILTER (WHERE status != 'cancelled'), 0) AS gmv_minor,
           COUNT(*) AS total_orders,
           COUNT(*) FILTER (WHERE status = 'pending_payment') AS pending_orders
         FROM orders
         WHERE created_at >= ${intervalClause};`
      ),
      targetPool.query(
        `SELECT
           (SELECT COUNT(*) FROM customers) AS total_customers,
           (SELECT COUNT(*) FROM sellers) AS total_sellers,
           (SELECT COUNT(*) FROM products WHERE is_active = true) AS active_products,
           (SELECT COUNT(*) FROM refund_requests WHERE status = 'pending') AS pending_refunds;`
      ),
      targetPool.query(
        `SELECT
           TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS day,
           COALESCE(SUM(grand_total_minor) FILTER (WHERE status != 'cancelled'), 0) AS gmv_minor,
           COUNT(*) AS order_count
         FROM orders
         WHERE created_at >= ${intervalClause}
         GROUP BY DATE_TRUNC('day', created_at)
         ORDER BY day ASC;`
      ),
      targetPool.query(
        `SELECT s.id, s.name, s.slug, COALESCE(SUM(sp.grand_total_minor), 0) AS gmv_minor, COUNT(sp.id) AS orders_count
         FROM sellers s
         LEFT JOIN seller_packages sp ON sp.seller_id = s.id AND sp.status != 'cancelled'
         GROUP BY s.id, s.name, s.slug
         ORDER BY gmv_minor DESC
         LIMIT 5;`
      ),
      targetPool.query(
        `SELECT p.id, p.title_en, p.slug, COALESCE(SUM(oi.line_total_minor), 0) AS revenue_minor, COALESCE(SUM(oi.quantity), 0) AS units_sold
         FROM products p
         LEFT JOIN order_items oi ON oi.product_id = p.id
         GROUP BY p.id, p.title_en, p.slug
         ORDER BY revenue_minor DESC, p.rating_count DESC
         LIMIT 5;`
      ),
      checkDatabaseHealth(targetPool),
    ]);

  const oa = ordersAgg.rows[0] || {};
  const ea = entitiesAgg.rows[0] || {};

  return {
    timeframe,
    kpis: {
      totalGmv: createMoney(parseInt(oa.gmv_minor || '0', 10), 'USD'),
      totalOrders: parseInt(oa.total_orders || '0', 10),
      pendingOrders: parseInt(oa.pending_orders || '0', 10),
      totalCustomers: parseInt(ea.total_customers || '0', 10),
      totalSellers: parseInt(ea.total_sellers || '0', 10),
      activeProducts: parseInt(ea.active_products || '0', 10),
      pendingRefunds: parseInt(ea.pending_refunds || '0', 10),
    },
    revenueTrend: revenueTrendRes.rows.map((r) => ({
      date: r.day,
      gmvMinor: parseInt(r.gmv_minor || '0', 10),
      orders: parseInt(r.order_count || '0', 10),
    })),
    topSellers: topSellersRes.rows.map((s) => ({
      sellerId: s.id,
      name: s.name,
      slug: s.slug,
      gmv: createMoney(parseInt(s.gmv_minor || '0', 10), 'USD'),
      ordersCount: parseInt(s.orders_count || '0', 10),
    })),
    topProducts: topProductsRes.rows.map((p) => ({
      productId: p.id,
      title: p.title_en,
      slug: p.slug,
      revenue: createMoney(parseInt(p.revenue_minor || '0', 10), 'USD'),
      unitsSold: parseInt(p.units_sold || '0', 10),
    })),
    systemHealth: {
      databaseStatus: dbHealth.isHealthy ? 'healthy' : 'unavailable',
      databaseLatencyMs: dbHealth.latencyMs,
      paymentGatewayStatus: 'unconfigured',
    },
  };
}

export async function listAdminSellers(
  query?: string,
  pool?: pg.Pool
): Promise<{ sellers: any[]; applications: any[] }> {
  const targetPool = pool || getDbPool();
  const clean = (query || '').trim().toLowerCase();

  const [sellersRes, appsRes] = await Promise.all([
    targetPool.query(
      `SELECT s.*, COUNT(DISTINCT so.id) AS offers_count
       FROM sellers s
       LEFT JOIN seller_offers so ON so.seller_id = s.id
       ${clean ? 'WHERE LOWER(s.name) LIKE $1 OR LOWER(s.slug) LIKE $1 OR LOWER(s.email) LIKE $1' : ''}
       GROUP BY s.id
       ORDER BY s.created_at DESC;`,
      clean ? [`%${clean}%`] : []
    ),
    targetPool.query('SELECT * FROM seller_applications ORDER BY submitted_at DESC;'),
  ]);

  return {
    sellers: sellersRes.rows.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      email: s.email,
      tier: s.tier,
      status: s.status,
      isVerified: Boolean(s.is_verified),
      activeProductsCount: parseInt(s.offers_count || '0', 10),
      joinedAt: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
    })),
    applications: appsRes.rows,
  };
}

export async function moderateSeller(
  params: {
    sellerId: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'suspended';
    reason?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      const res = await client.query(
        `UPDATE sellers
         SET status = $2,
             is_verified = CASE WHEN $2 = 'approved' THEN true ELSE false END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [params.sellerId, params.status]
      );
      if (res.rows.length === 0) throw new NotFoundError('Seller not found.');

      await client.query(
        `UPDATE seller_applications
         SET status = $2, reviewer_id = $3, reviewer_notes = $4, decided_at = NOW()
         WHERE seller_id = $1;`,
        [
          params.sellerId,
          params.status === 'approved' ? 'approved' : params.status === 'rejected' ? 'rejected' : 'under_review',
          params.actorId,
          params.reason || null,
        ]
      );

      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'SELLER_MODERATED',
        targetType: 'seller',
        targetId: params.sellerId,
        metadata: { status: params.status, reason: params.reason },
      });

      return res.rows[0];
    },
    undefined,
    pool
  );
}

export async function listAdminCustomers(pool?: pg.Pool): Promise<Array<Record<string, any>>> {
  const res = await dbQuery<any>(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.status, c.role, c.email_verified, c.created_at,
            COUNT(DISTINCT o.id) AS orders_count,
            COALESCE(SUM(o.grand_total_minor), 0) AS total_spent_minor
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id
     ORDER BY c.created_at DESC
     LIMIT 200;`,
    [],
    pool
  );

  return res.rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: `${r.first_name} ${r.last_name}`,
    status: r.status,
    role: r.role,
    emailVerified: Boolean(r.email_verified),
    ordersCount: parseInt(r.orders_count || '0', 10),
    totalSpent: createMoney(parseInt(r.total_spent_minor || '0', 10), 'USD'),
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function moderateCustomer(
  params: {
    customerId: string;
    status: 'active' | 'suspended' | 'locked';
    note?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      const res = await client.query(
        `UPDATE customers SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING id, email, status;`,
        [params.customerId, params.status]
      );
      if (res.rows.length === 0) throw new NotFoundError('Customer not found.');

      if (params.status !== 'active') {
        await client.query(
          `UPDATE user_sessions SET revoked_at = NOW(), revocation_reason = 'admin_suspended'
           WHERE customer_id = $1 AND revoked_at IS NULL;`,
          [params.customerId]
        );
      }

      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'CUSTOMER_MODERATED',
        targetType: 'customer',
        targetId: params.customerId,
        metadata: { status: params.status, note: params.note },
      });

      return res.rows[0];
    },
    undefined,
    pool
  );
}

export async function moderateProduct(
  params: {
    productId: string;
    moderationStatus: 'approved' | 'pending_review' | 'rejected' | 'flagged';
    reason?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      const res = await client.query(
        `UPDATE products
         SET moderation_status = $2,
             moderation_reason = $3,
             is_active = CASE WHEN $2 = 'approved' THEN true ELSE false END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, slug, moderation_status, is_active;`,
        [params.productId, params.moderationStatus, params.reason || null]
      );
      if (res.rows.length === 0) throw new NotFoundError('Product not found.');

      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'PRODUCT_MODERATED',
        targetType: 'product',
        targetId: params.productId,
        metadata: { moderationStatus: params.moderationStatus, reason: params.reason },
      });

      return res.rows[0];
    },
    undefined,
    pool
  );
}

export async function createOrToggleAdminCategory(
  params:
    | {
        mode: 'create';
        nameEn: string;
        slug: string;
        parentId?: string | null;
        icon?: string;
        actorId: string;
        actorName: string;
        actorRole: string;
      }
    | {
        mode: 'toggle';
        categoryId: string;
        actorId: string;
        actorName: string;
        actorRole: string;
      },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      if (params.mode === 'create') {
        const id = `cat-${crypto.randomUUID().slice(0, 12)}`;
        let level = 0;
        if (params.parentId) {
          const parentRes = await client.query<{ level: number }>(
            'SELECT level FROM categories WHERE id = $1 LIMIT 1;',
            [params.parentId]
          );
          if (parentRes.rows.length === 0) throw new NotFoundError('Parent category not found.');
          level = Number(parentRes.rows[0]!.level) + 1;
        }

        const res = await client.query(
          `INSERT INTO categories (id, parent_id, slug, name_en, level, icon, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)
           RETURNING *;`,
          [id, params.parentId || null, params.slug.toLowerCase(), params.nameEn.trim(), level, params.icon || null]
        );

        await recordAdminAuditLog(client, {
          actorId: params.actorId,
          actorName: params.actorName,
          actorRole: params.actorRole,
          action: 'CATEGORY_CREATED',
          targetType: 'category',
          targetId: id,
          metadata: { slug: params.slug },
        });
        return res.rows[0];
      }

      const res = await client.query(
        `UPDATE categories SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *;`,
        [params.categoryId]
      );
      if (res.rows.length === 0) throw new NotFoundError('Category not found.');

      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'CATEGORY_TOGGLED',
        targetType: 'category',
        targetId: params.categoryId,
        metadata: { isActive: res.rows[0].is_active },
      });
      return res.rows[0];
    },
    undefined,
    pool
  );
}

export async function listAdminOrders(pool?: pg.Pool): Promise<Array<Record<string, any>>> {
  const res = await dbQuery<any>(
    `SELECT o.*, c.email AS customer_email, c.first_name, c.last_name
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     ORDER BY o.created_at DESC
     LIMIT 100;`,
    [],
    pool
  );

  return res.rows.map((o) => ({
    orderId: o.id,
    customerId: o.customer_id,
    customerEmail: o.customer_email || '',
    status: o.status,
    paymentStatus: o.payment_status || 'pending_payment',
    fulfillmentStatus: o.fulfillment_status || 'unfulfilled',
    itemCount: Number(o.item_count),
    grandTotal: createMoney(Number(o.grand_total_minor), (o.currency || 'USD') as any),
    createdAt: new Date(o.created_at).toISOString(),
  }));
}

export async function adminTransitionOrder(
  params: {
    orderId: string;
    status: OrderLifecycleStatus;
    reason?: string;
    actorId: string;
    actorRole: string;
  },
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return transitionOrderLifecycle(
    {
      orderId: params.orderId,
      targetStatus: params.status,
      actorId: params.actorId,
      actorRole: params.actorRole,
      reason: params.reason,
    },
    pool
  );
}

export async function listAdminAuditLogs(
  filters: { action?: string; outcome?: string; q?: string } = {},
  pool?: pg.Pool
): Promise<Array<Record<string, any>>> {
  const conditions: string[] = ['1=1'];
  const values: any[] = [];
  let idx = 1;

  if (filters.action) {
    conditions.push(`LOWER(action) = LOWER($${idx})`);
    values.push(filters.action);
    idx++;
  }
  if (filters.outcome) {
    conditions.push(`outcome = $${idx}`);
    values.push(filters.outcome);
    idx++;
  }
  if (filters.q) {
    conditions.push(`(actor_name ILIKE $${idx} OR action ILIKE $${idx} OR target_id ILIKE $${idx})`);
    values.push(`%${filters.q}%`);
    idx++;
  }

  const res = await dbQuery<any>(
    `SELECT * FROM audit_logs WHERE ${conditions.join(' AND ')} ORDER BY timestamp DESC LIMIT 200;`,
    values,
    pool
  );

  return res.rows.map((r) => ({
    id: r.id,
    timestamp: new Date(r.timestamp).toISOString(),
    actor: { id: r.actor_id, name: r.actor_name, role: r.actor_role },
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    metadata: r.metadata,
    outcome: r.outcome,
  }));
}

export async function getPlatformSettings(pool?: pg.Pool): Promise<Record<string, any> | null> {
  const res = await dbQuery<any>("SELECT * FROM platform_settings WHERE id = 'default' LIMIT 1;", [], pool);
  return res.rows[0] || null;
}

export async function updatePlatformSettings(
  actorId: string,
  actorName: string,
  actorRole: string,
  input: Partial<{
    marketplaceName: string;
    supportEmail: string;
    defaultCurrency: string;
    platformCommissionBps: number;
    maintenanceMode: boolean;
    allowSellerRegistrations: boolean;
    requireProductModeration: boolean;
  }>,
  pool?: pg.Pool
): Promise<Record<string, any>> {
  return await withTransaction(
    async (client) => {
      const curRes = await client.query("SELECT * FROM platform_settings WHERE id = 'default' FOR UPDATE;");
      const cur = curRes.rows[0];
      if (!cur) throw new NotFoundError('Platform settings row not initialized.');

      const res = await client.query(
        `UPDATE platform_settings
         SET marketplace_name = $1,
             support_email = $2,
             default_currency = $3,
             platform_commission_bps = $4,
             maintenance_mode = $5,
             allow_seller_registrations = $6,
             require_product_moderation = $7,
             updated_by = $8,
             updated_at = NOW()
         WHERE id = 'default'
         RETURNING *;`,
        [
          input.marketplaceName ?? cur.marketplace_name,
          input.supportEmail ?? cur.support_email,
          input.defaultCurrency ?? cur.default_currency,
          input.platformCommissionBps ?? cur.platform_commission_bps,
          input.maintenanceMode ?? cur.maintenance_mode,
          input.allowSellerRegistrations ?? cur.allow_seller_registrations,
          input.requireProductModeration ?? cur.require_product_moderation,
          actorId,
        ]
      );

      await recordAdminAuditLog(client, {
        actorId,
        actorName,
        actorRole,
        action: 'PLATFORM_SETTINGS_UPDATED',
        targetType: 'platform_settings',
        targetId: 'default',
        metadata: input as Record<string, unknown>,
      });

      return res.rows[0];
    },
    undefined,
    pool
  );
}

export async function listAndManageCoupons(
  params:
    | { mode: 'list' }
    | {
        mode: 'create';
        code: string;
        description: string;
        discountType: string;
        discountValue: number;
        minOrderMinor?: number;
        actorId: string;
        actorName: string;
        actorRole: string;
      }
    | { mode: 'toggle'; couponId: string; actorId: string; actorName: string; actorRole: string },
  pool?: pg.Pool
): Promise<Record<string, any> | Array<Record<string, any>>> {
  const targetPool = pool || getDbPool();
  if (params.mode === 'list') {
    const res = await targetPool.query('SELECT * FROM coupons ORDER BY created_at DESC;');
    return res.rows;
  }

  return await withTransaction(
    async (client) => {
      if (params.mode === 'create') {
        const id = `cpn-${crypto.randomUUID().slice(0, 12)}`;
        const res = await client.query(
          `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_minor, is_active)
           VALUES ($1, UPPER($2), $3, $4, $5, $6, true)
           RETURNING *;`,
          [
            id,
            params.code.trim(),
            params.description,
            params.discountType,
            params.discountValue,
            params.minOrderMinor || 0,
          ]
        );
        await recordAdminAuditLog(client, {
          actorId: params.actorId,
          actorName: params.actorName,
          actorRole: params.actorRole,
          action: 'COUPON_CREATED',
          targetType: 'coupon',
          targetId: id,
        });
        return res.rows[0];
      }

      const res = await client.query(
        'UPDATE coupons SET is_active = NOT is_active WHERE id = $1 RETURNING *;',
        [params.couponId]
      );
      if (res.rows.length === 0) throw new NotFoundError('Coupon not found.');
      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'COUPON_TOGGLED',
        targetType: 'coupon',
        targetId: params.couponId,
      });
      return res.rows[0];
    },
    undefined,
    targetPool
  );
}

export async function listAndManagePromotions(
  params:
    | { mode: 'list' }
    | {
        mode: 'create';
        name: string;
        description: string;
        discountPercentage: number;
        bannerText?: string;
        actorId: string;
        actorName: string;
        actorRole: string;
      },
  pool?: pg.Pool
): Promise<Record<string, any> | Array<Record<string, any>>> {
  const targetPool = pool || getDbPool();
  if (params.mode === 'list') {
    const res = await targetPool.query('SELECT * FROM promotions ORDER BY created_at DESC;');
    return res.rows;
  }

  return await withTransaction(
    async (client) => {
      const id = `prm-${crypto.randomUUID().slice(0, 12)}`;
      const res = await client.query(
        `INSERT INTO promotions (id, name, description, discount_percentage, banner_text, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *;`,
        [id, params.name, params.description, params.discountPercentage, params.bannerText || null]
      );
      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'PROMOTION_CREATED',
        targetType: 'promotion',
        targetId: id,
      });
      return res.rows[0];
    },
    undefined,
    targetPool
  );
}

export async function listAndReviewRefunds(
  params:
    | { mode: 'list' }
    | {
        mode: 'review';
        refundId: string;
        status: 'approved' | 'rejected';
        adminNote?: string;
        actorId: string;
        actorName: string;
        actorRole: string;
      },
  pool?: pg.Pool
): Promise<Record<string, any> | Array<Record<string, any>>> {
  const targetPool = pool || getDbPool();
  if (params.mode === 'list') {
    const res = await targetPool.query('SELECT * FROM refund_requests ORDER BY created_at DESC;');
    return res.rows;
  }

  // External payment gateway payout is explicitly not wired: never falsely mark funds settled externally!
  if (params.status === 'approved' && !process.env['PAYMENT_GATEWAY_SECRET']) {
    throw new ValidationError(
      'External payment gateway is not configured; automated refund payouts remain disabled pending Stripe/Adyen integration.'
    );
  }

  return await withTransaction(
    async (client) => {
      const res = await client.query(
        `UPDATE refund_requests
         SET status = $2, admin_note = $3, reviewed_by = $4, updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [params.refundId, params.status, params.adminNote || null, params.actorId]
      );
      if (res.rows.length === 0) throw new NotFoundError('Refund request not found.');
      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'REFUND_REVIEWED',
        targetType: 'refund',
        targetId: params.refundId,
        metadata: { status: params.status },
      });
      return res.rows[0];
    },
    undefined,
    targetPool
  );
}

export async function listAndReviewReturns(
  params:
    | { mode: 'list' }
    | {
        mode: 'review';
        returnId: string;
        status: 'approved' | 'rejected' | 'completed';
        adminNote?: string;
        actorId: string;
        actorName: string;
        actorRole: string;
      },
  pool?: pg.Pool
): Promise<Record<string, any> | Array<Record<string, any>>> {
  const targetPool = pool || getDbPool();
  if (params.mode === 'list') {
    const res = await targetPool.query('SELECT * FROM return_requests ORDER BY created_at DESC;');
    return res.rows;
  }

  return await withTransaction(
    async (client) => {
      const res = await client.query(
        `UPDATE return_requests
         SET status = $2, admin_note = $3, reviewed_by = $4, updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [params.returnId, params.status, params.adminNote || null, params.actorId]
      );
      if (res.rows.length === 0) throw new NotFoundError('Return request not found.');
      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'RETURN_REVIEWED',
        targetType: 'return',
        targetId: params.returnId,
        metadata: { status: params.status },
      });
      return res.rows[0];
    },
    undefined,
    targetPool
  );
}

export async function listAndModerateReviews(
  params:
    | { mode: 'list' }
    | {
        mode: 'moderate';
        reviewId: string;
        status: 'approved' | 'rejected' | 'flagged';
        actorId: string;
        actorName: string;
        actorRole: string;
      },
  pool?: pg.Pool
): Promise<Record<string, any> | Array<Record<string, any>>> {
  const targetPool = pool || getDbPool();
  if (params.mode === 'list') {
    const res = await targetPool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 100;');
    return res.rows;
  }

  return await withTransaction(
    async (client) => {
      const res = await client.query(
        `UPDATE reviews SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *;`,
        [params.reviewId, params.status]
      );
      if (res.rows.length === 0) throw new NotFoundError('Review not found.');
      await recordAdminAuditLog(client, {
        actorId: params.actorId,
        actorName: params.actorName,
        actorRole: params.actorRole,
        action: 'REVIEW_MODERATED',
        targetType: 'review',
        targetId: params.reviewId,
        metadata: { status: params.status },
      });
      return res.rows[0];
    },
    undefined,
    targetPool
  );
}
