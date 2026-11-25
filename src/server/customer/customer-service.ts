import crypto from 'node:crypto';
import type pg from 'pg';
import { dbQuery, getDbPool, withTransaction } from '@/server/db/client';
import { mapRowToProduct } from '@/server/dataloaders';
import { NotFoundError } from '@/server/security/http';
import type { CustomerAddress, AddressUpsertInput } from '@/domains/customer/types/address';
import type { WishlistItem } from '@/domains/customer/types/wishlist';
import type { CustomerPreferences } from '@/domains/customer/types/customer';
import type { CustomerOrder } from '@/domains/customer/types/order';
import { createMoney } from '@/domains/catalog/utils/money';

function mapAddressRow(row: any): CustomerAddress {
  return {
    id: row.id,
    customerId: row.customer_id,
    label: (row.label || 'home') as CustomerAddress['label'],
    fullName: row.full_name,
    streetAddress: row.street_line1,
    streetAddress2: row.street_line2 || undefined,
    city: row.city,
    stateOrProvince: row.state_province,
    postalCode: row.postal_code,
    countryCode: row.country_code || 'US',
    phoneNumber: row.phone,
    isDefaultShipping: Boolean(row.is_default_shipping),
    isDefaultBilling: Boolean(row.is_default_billing),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

/**
 * Wishlist CRUD (PostgreSQL-backed, strictly scoped to authenticated customerId)
 */
export async function getCustomerWishlist(customerId: string, pool?: pg.Pool): Promise<WishlistItem[]> {
  const res = await dbQuery<any>(
    `SELECT
       wi.created_at AS wish_added_at,
       p.*,
       b.name AS brand_name,
       b.slug AS brand_slug,
       o.price_minor AS lowest_price_minor,
       o.currency AS offer_currency,
       o.id AS buy_box_offer_id
     FROM wishlist_items wi
     JOIN products p ON p.id = wi.product_id
     LEFT JOIN brands b ON b.id = p.brand_id
     LEFT JOIN LATERAL (
       SELECT id, price_minor, currency
       FROM seller_offers
       WHERE product_id = p.id
       ORDER BY is_buy_box_winner DESC, price_minor ASC
       LIMIT 1
     ) o ON true
     WHERE wi.customer_id = $1
     ORDER BY wi.created_at DESC;`,
    [customerId],
    pool
  );

  return res.rows.map((row) => {
    const prod = mapRowToProduct(row);
    if (row.lowest_price_minor !== null && row.lowest_price_minor !== undefined) {
      prod.offerSummary = {
        offerCount: 1,
        lowestPrice: createMoney(Number(row.lowest_price_minor), (row.offer_currency || 'USD') as any),
        highestPrice: createMoney(Number(row.lowest_price_minor), (row.offer_currency || 'USD') as any),
        buyBoxOfferId: row.buy_box_offer_id,
        hasMultipleOffers: false,
      };
    }
    return {
      productId: row.id,
      addedAt: row.wish_added_at ? new Date(row.wish_added_at).toISOString() : new Date().toISOString(),
      productSnapshot: prod,
    };
  });
}

export async function mutateCustomerWishlist(
  customerId: string,
  action: 'add' | 'remove' | 'toggle' | 'get',
  productId?: string,
  pool?: pg.Pool
): Promise<WishlistItem[]> {
  const targetPool = pool || getDbPool();

  if (action !== 'get' && productId) {
    // Ensure product exists when adding/toggling
    const prodExists = await targetPool.query('SELECT id FROM products WHERE id = $1 LIMIT 1;', [productId]);
    if (prodExists.rows.length === 0 && action === 'add') {
      throw new NotFoundError(`Product ${productId} does not exist.`);
    }

    if (action === 'add' && prodExists.rows.length > 0) {
      await targetPool.query(
        `INSERT INTO wishlist_items (id, customer_id, product_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (customer_id, product_id) DO NOTHING;`,
        [`wl-${crypto.randomUUID().slice(0, 12)}`, customerId, productId]
      );
    } else if (action === 'remove') {
      await targetPool.query(
        'DELETE FROM wishlist_items WHERE customer_id = $1 AND product_id = $2;',
        [customerId, productId]
      );
    } else if (action === 'toggle') {
      const existing = await targetPool.query(
        'SELECT id FROM wishlist_items WHERE customer_id = $1 AND product_id = $2 LIMIT 1;',
        [customerId, productId]
      );
      if (existing.rows.length > 0) {
        await targetPool.query('DELETE FROM wishlist_items WHERE id = $1;', [existing.rows[0].id]);
      } else {
        if (prodExists.rows.length === 0) {
          throw new NotFoundError(`Product ${productId} does not exist.`);
        }
        await targetPool.query(
          `INSERT INTO wishlist_items (id, customer_id, product_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (customer_id, product_id) DO NOTHING;`,
          [`wl-${crypto.randomUUID().slice(0, 12)}`, customerId, productId]
        );
      }
    }
  }

  return getCustomerWishlist(customerId, targetPool);
}

/**
 * Customer Addresses CRUD with strict ownership checks
 */
export async function getCustomerAddresses(customerId: string, pool?: pg.Pool): Promise<CustomerAddress[]> {
  const res = await dbQuery(
    `SELECT * FROM customer_addresses
     WHERE customer_id = $1
     ORDER BY is_default_shipping DESC, updated_at DESC;`,
    [customerId],
    pool
  );
  return res.rows.map(mapAddressRow);
}

export async function createCustomerAddress(
  customerId: string,
  input: AddressUpsertInput,
  pool?: pg.Pool
): Promise<CustomerAddress> {
  return await withTransaction(
    async (client) => {
      if (input.isDefaultShipping) {
        await client.query(
          'UPDATE customer_addresses SET is_default_shipping = false WHERE customer_id = $1;',
          [customerId]
        );
      }
      if (input.isDefaultBilling) {
        await client.query(
          'UPDATE customer_addresses SET is_default_billing = false WHERE customer_id = $1;',
          [customerId]
        );
      }

      const id = `addr-${crypto.randomUUID().slice(0, 12)}`;
      const res = await client.query(
        `INSERT INTO customer_addresses (
           id, customer_id, label, full_name, street_line1, street_line2,
           city, state_province, postal_code, country_code, phone,
           is_default_shipping, is_default_billing
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *;`,
        [
          id,
          customerId,
          input.label,
          input.fullName,
          input.streetAddress,
          input.streetAddress2 || null,
          input.city,
          input.stateOrProvince,
          input.postalCode,
          input.countryCode,
          input.phoneNumber,
          Boolean(input.isDefaultShipping),
          Boolean(input.isDefaultBilling),
        ]
      );

      return mapAddressRow(res.rows[0]);
    },
    undefined,
    pool
  );
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  input: Partial<AddressUpsertInput>,
  pool?: pg.Pool
): Promise<CustomerAddress> {
  return await withTransaction(
    async (client) => {
      const existing = await client.query(
        'SELECT * FROM customer_addresses WHERE id = $1 AND customer_id = $2 FOR UPDATE;',
        [addressId, customerId]
      );
      if (existing.rows.length === 0) {
        throw new NotFoundError('Address not found or access denied.');
      }

      if (input.isDefaultShipping) {
        await client.query(
          'UPDATE customer_addresses SET is_default_shipping = false WHERE customer_id = $1;',
          [customerId]
        );
      }
      if (input.isDefaultBilling) {
        await client.query(
          'UPDATE customer_addresses SET is_default_billing = false WHERE customer_id = $1;',
          [customerId]
        );
      }

      const cur = existing.rows[0];
      const res = await client.query(
        `UPDATE customer_addresses
         SET label = $3,
             full_name = $4,
             street_line1 = $5,
             street_line2 = $6,
             city = $7,
             state_province = $8,
             postal_code = $9,
             country_code = $10,
             phone = $11,
             is_default_shipping = $12,
             is_default_billing = $13,
             updated_at = NOW()
         WHERE id = $1 AND customer_id = $2
         RETURNING *;`,
        [
          addressId,
          customerId,
          input.label ?? cur.label,
          input.fullName ?? cur.full_name,
          input.streetAddress ?? cur.street_line1,
          input.streetAddress2 ?? cur.street_line2,
          input.city ?? cur.city,
          input.stateOrProvince ?? cur.state_province,
          input.postalCode ?? cur.postal_code,
          input.countryCode ?? cur.country_code,
          input.phoneNumber ?? cur.phone,
          input.isDefaultShipping ?? cur.is_default_shipping,
          input.isDefaultBilling ?? cur.is_default_billing,
        ]
      );

      return mapAddressRow(res.rows[0]);
    },
    undefined,
    pool
  );
}

export async function deleteCustomerAddress(
  customerId: string,
  addressId: string,
  pool?: pg.Pool
): Promise<void> {
  const res = await dbQuery(
    'DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2;',
    [addressId, customerId],
    pool
  );
  if (res.rowCount === 0) {
    throw new NotFoundError('Address not found or access denied.');
  }
}

/**
 * Customer Profile & Preferences Update (Mass-assignment safe)
 */
export async function updateCustomerProfileAndPreferences(
  customerId: string,
  input: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string | null;
    preferences?: Partial<CustomerPreferences>;
  },
  pool?: pg.Pool
): Promise<any> {
  return await withTransaction(
    async (client) => {
      const existing = await client.query('SELECT * FROM customers WHERE id = $1 FOR UPDATE;', [
        customerId,
      ]);
      if (existing.rows.length === 0) {
        throw new NotFoundError('Customer account not found.');
      }

      const cur = existing.rows[0];
      const mergedPrefs = {
        ...(typeof cur.preferences === 'object' && cur.preferences ? cur.preferences : {}),
        ...(input.preferences || {}),
      };

      const res = await client.query(
        `UPDATE customers
         SET first_name = $2,
             last_name = $3,
             phone = $4,
             preferences = $5,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, first_name, last_name, phone, avatar_url, status, email_verified, role, preferences, created_at, updated_at;`,
        [
          customerId,
          input.firstName?.trim() ?? cur.first_name,
          input.lastName?.trim() ?? cur.last_name,
          input.phoneNumber !== undefined ? input.phoneNumber : cur.phone,
          JSON.stringify(mergedPrefs),
        ]
      );

      return res.rows[0];
    },
    undefined,
    pool
  );
}

/**
 * Customer Order History (Strictly scoped by customerId)
 */
export async function listCustomerOrders(
  customerId: string,
  filters?: { status?: string; q?: string },
  pool?: pg.Pool
): Promise<CustomerOrder[]> {
  const targetPool = pool || getDbPool();
  const conditions: string[] = ['o.customer_id = $1'];
  const values: any[] = [customerId];
  let idx = 2;

  if (filters?.status && filters.status !== 'all') {
    conditions.push(`o.status = $${idx}`);
    values.push(filters.status);
    idx++;
  }

  if (filters?.q) {
    conditions.push(`(o.id ILIKE $${idx} OR o.tracking_number ILIKE $${idx} OR o.carrier ILIKE $${idx})`);
    values.push(`%${filters.q}%`);
    idx++;
  }

  const ordersRes = await targetPool.query(
    `SELECT * FROM orders o WHERE ${conditions.join(' AND ')} ORDER BY o.created_at DESC;`,
    values
  );

  const results: CustomerOrder[] = [];
  for (const row of ordersRes.rows) {
    const detail = await getCustomerOrderById(customerId, row.id, false, targetPool);
    if (detail) results.push(detail);
  }
  return results;
}

export async function getCustomerOrderById(
  actorCustomerId: string,
  orderId: string,
  allowAdminOverride = false,
  pool?: pg.Pool
): Promise<CustomerOrder | null> {
  const targetPool = pool || getDbPool();
  const res = allowAdminOverride
    ? await targetPool.query('SELECT * FROM orders WHERE id = $1 OR tracking_number = $1 LIMIT 1;', [orderId])
    : await targetPool.query(
        'SELECT * FROM orders WHERE (id = $1 OR tracking_number = $1) AND customer_id = $2 LIMIT 1;',
        [orderId, actorCustomerId]
      );

  if (res.rows.length === 0) return null;
  const o = res.rows[0];
  const currency = (o.currency || 'USD') as any;

  const pkgRes = await targetPool.query(
    `SELECT sp.*, s.name AS seller_name
     FROM seller_packages sp
     LEFT JOIN sellers s ON s.id = sp.seller_id
     WHERE sp.order_id = $1
     ORDER BY sp.created_at ASC;`,
    [o.id]
  );

  const itemsRes = await targetPool.query(
    `SELECT oi.*, p.slug AS product_slug, p.primary_image_url, s.name AS seller_name, s.slug AS seller_slug, s.is_verified AS seller_verified
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     LEFT JOIN sellers s ON s.id = oi.seller_id
     WHERE oi.order_id = $1;`,
    [o.id]
  );

  const histRes = await targetPool.query(
    `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at DESC;`,
    [o.id]
  );

  const vendorPackages = pkgRes.rows.map((pkg) => {
    const pkgItems = itemsRes.rows
      .filter((it) => !it.package_id || it.package_id === pkg.id)
      .filter((it) => it.seller_id === pkg.seller_id)
      .map((it) => {
        const unitPrice = createMoney(Number(it.unit_price_minor), currency);
        const qty = Number(it.quantity);
        const createdAt = it.created_at ? new Date(it.created_at).toISOString() : new Date().toISOString();
        return {
          id: it.id,
          productId: it.product_id,
          offerId: it.offer_id || it.sku,
          slug: it.product_slug || it.product_id,
          title: typeof it.title === 'string' ? { en: it.title } : it.title,
          imageUrl: it.primary_image_url || undefined,
          sellerId: it.seller_id,
          sellerName: it.seller_name || pkg.seller_name || it.seller_id,
          sellerSlug: it.seller_slug || it.seller_id,
          isSellerVerified: Boolean(it.seller_verified),
          unitPrice,
          quantity: qty,
          lineTotal: createMoney(Number(it.unit_price_minor) * qty, currency),
          maxAvailableQuantity: 99,
          shippingEstimate: {
            minDays: 2,
            maxDays: 5,
            isFreeShipping: true,
            shippingCost: createMoney(0, currency),
          },
          createdAt,
          updatedAt: createdAt,
        };
      });

    return {
      sellerId: pkg.seller_id,
      sellerName: pkg.seller_name || pkg.seller_id,
      deliveryMethod: (o.delivery_method || 'standard') as 'standard' | 'express',
      shippingFee: createMoney(Number(pkg.shipping_minor || 0), currency),
      subtotal: createMoney(Number(pkg.subtotal_minor || 0), currency),
      estimatedDays: o.estimated_delivery || '3-5 business days',
      items: pkgItems,
    };
  });

  const addr = typeof o.shipping_address === 'object' && o.shipping_address ? o.shipping_address : {};

  return {
    orderId: o.id,
    customerId: o.customer_id,
    currency,
    itemsSubtotal: createMoney(Number(o.items_subtotal_minor), currency),
    shippingTotal: createMoney(Number(o.shipping_total_minor || 0), currency),
    grandTotal: createMoney(Number(o.grand_total_minor), currency),
    itemCount: Number(o.item_count),
    status: o.status,
    createdAt: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
    updatedAt: o.updated_at ? new Date(o.updated_at).toISOString() : new Date().toISOString(),
    shippingAddress: {
      id: 'addr-snapshot',
      customerId: o.customer_id,
      label: 'home',
      fullName: addr.name || addr.fullName || 'Customer',
      streetAddress: addr.street || addr.address || '',
      city: addr.city || '',
      stateOrProvince: addr.state || '',
      postalCode: addr.postalCode || '',
      countryCode: addr.country || 'US',
      phoneNumber: addr.phone || '',
      isDefaultShipping: true,
      isDefaultBilling: true,
      createdAt: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
      updatedAt: o.updated_at ? new Date(o.updated_at).toISOString() : new Date().toISOString(),
    },
    vendorPackages,
    trackingNumber: o.tracking_number || pkgRes.rows[0]?.tracking_number || undefined,
    carrier: o.carrier || pkgRes.rows[0]?.carrier || undefined,
    estimatedDelivery: o.estimated_delivery || '3-5 business days',
    trackingEvents: histRes.rows.map((h) => ({
      status: h.new_status,
      location: 'Fulfillment Hub',
      timestamp: new Date(h.created_at).toISOString(),
      description: h.reason || `Transitioned to ${h.new_status}`,
    })),
    isDemo: false,
  };
}
