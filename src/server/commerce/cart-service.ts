import crypto from 'node:crypto';
import type pg from 'pg';
import { getDbPool, withTransaction } from '@/server/db/client';
import { generateSecureToken, hashToken } from '@/server/security/crypto';
import { buildCartState } from '@/domains/cart/utils/calculations';
import type { Cart, CartItem } from '@/domains/cart/types/cart';
import type { CurrencyCode } from '@/domains/catalog/types/pricing';
import { ConflictError, NotFoundError, ValidationError } from '@/server/security/http';

export interface CartIdentity {
  customerId?: string;
  guestToken?: string;
}

export interface PersistedCartResult {
  cartId: string;
  cart: Cart;
  newGuestToken?: string;
}

const CART_TTL_DAYS = 30;
const MAX_ITEM_QTY = 99;

function mapRowsToCartItems(rows: any[]): CartItem[] {
  return rows.map((row) => {
    const currency = (row.offer_currency || row.currency || 'USD') as CurrencyCode;
    const amountMinor = Number(row.offer_price_minor);
    const quantity = Number(row.quantity);
    const maxAvailableQuantity = Math.max(
      1,
      Math.min(MAX_ITEM_QTY, Number(row.stock_quantity) - Number(row.reserved_quantity || 0))
    );
    const createdAt = row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString();
    const updatedAt = row.updated_at ? new Date(row.updated_at).toISOString() : createdAt;

    return {
      id: row.id,
      productId: row.product_id,
      slug: row.product_slug,
      title: { en: row.title_en },
      imageUrl: row.primary_image_url || undefined,
      variantId: row.variant_id || undefined,
      selectedOptions: row.variant_label ? { variant: row.variant_label } : undefined,
      offerId: row.offer_id,
      sellerId: row.seller_id,
      sellerName: row.seller_name,
      sellerSlug: row.seller_slug,
      isSellerVerified: Boolean(row.seller_verified),
      unitPrice: {
        amountMinor,
        currency,
      },
      quantity,
      lineTotal: {
        amountMinor: amountMinor * quantity,
        currency,
      },
      maxAvailableQuantity,
      shippingEstimate: {
        minDays: 2,
        maxDays: 5,
        isFreeShipping: Boolean(row.is_free_shipping),
        shippingCost: {
          amountMinor: Boolean(row.is_free_shipping) ? 0 : Number(row.shipping_cost_minor || 0),
          currency,
        },
      },
      createdAt,
      updatedAt,
    };
  });
}

async function loadCartItemsWithClient(
  client: pg.PoolClient | pg.Pool,
  cartId: string
): Promise<CartItem[]> {
  const res = await client.query(
    `SELECT
       ci.*,
       p.slug AS product_slug,
       p.title_en,
       p.primary_image_url,
       s.name AS seller_name,
       s.slug AS seller_slug,
       s.is_verified AS seller_verified,
       so.price_minor AS offer_price_minor,
       so.currency AS offer_currency,
       so.stock_quantity,
       so.reserved_quantity,
       so.is_free_shipping,
       so.shipping_cost_minor
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN seller_offers so ON so.id = ci.offer_id
     JOIN sellers s ON s.id = ci.seller_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at ASC;`,
    [cartId]
  );

  return mapRowsToCartItems(res.rows);
}

async function resolveOrCreateCartRow(
  client: pg.PoolClient,
  identity: CartIdentity
): Promise<{ cartId: string; currency: CurrencyCode; newGuestToken?: string }> {
  if (identity.customerId) {
    const existing = await client.query<{ id: string; currency: string }>(
      `SELECT id, currency FROM carts
       WHERE customer_id = $1 AND status = 'active' AND expires_at > NOW()
       LIMIT 1;`,
      [identity.customerId]
    );

    if (existing.rows.length > 0) {
      return {
        cartId: existing.rows[0]!.id,
        currency: (existing.rows[0]!.currency || 'USD') as CurrencyCode,
      };
    }

    const cartId = `cart-${crypto.randomUUID().slice(0, 12)}`;
    const expiresAt = new Date(Date.now() + CART_TTL_DAYS * 86400 * 1000);
    await client.query(
      `INSERT INTO carts (id, customer_id, currency, status, expires_at)
       VALUES ($1, $2, 'USD', 'active', $3);`,
      [cartId, identity.customerId, expiresAt]
    );
    return { cartId, currency: 'USD' };
  }

  if (identity.guestToken) {
    const guestHash = hashToken(identity.guestToken);
    const existing = await client.query<{ id: string; currency: string }>(
      `SELECT id, currency FROM carts
       WHERE guest_token_hash = $1 AND status = 'active' AND expires_at > NOW()
       LIMIT 1;`,
      [guestHash]
    );

    if (existing.rows.length > 0) {
      return {
        cartId: existing.rows[0]!.id,
        currency: (existing.rows[0]!.currency || 'USD') as CurrencyCode,
      };
    }
  }

  // Mint secure anonymous guest token
  const rawGuestToken = generateSecureToken(24);
  const cartId = `cart-${crypto.randomUUID().slice(0, 12)}`;
  const expiresAt = new Date(Date.now() + CART_TTL_DAYS * 86400 * 1000);
  await client.query(
    `INSERT INTO carts (id, guest_token_hash, currency, status, expires_at)
     VALUES ($1, $2, 'USD', 'active', $3);`,
    [cartId, hashToken(rawGuestToken), expiresAt]
  );

  return { cartId, currency: 'USD', newGuestToken: rawGuestToken };
}

/**
 * Loads the persisted cart for either an authenticated customer or an anonymous guest.
 */
export async function getPersistedCart(
  identity: CartIdentity,
  pool?: pg.Pool
): Promise<PersistedCartResult> {
  const targetPool = pool || getDbPool();

  if (!identity.customerId && !identity.guestToken) {
    return {
      cartId: 'empty',
      cart: buildCartState([], 'USD'),
    };
  }

  const res = identity.customerId
    ? await targetPool.query<{ id: string; currency: string }>(
        `SELECT id, currency FROM carts
         WHERE customer_id = $1 AND status = 'active' AND expires_at > NOW()
         LIMIT 1;`,
        [identity.customerId]
      )
    : await targetPool.query<{ id: string; currency: string }>(
        `SELECT id, currency FROM carts
         WHERE guest_token_hash = $1 AND status = 'active' AND expires_at > NOW()
         LIMIT 1;`,
        [hashToken(identity.guestToken!)]
      );

  if (res.rows.length === 0) {
    return {
      cartId: 'empty',
      cart: buildCartState([], 'USD'),
    };
  }

  const cartRow = res.rows[0]!;
  const items = await loadCartItemsWithClient(targetPool, cartRow.id);
  return {
    cartId: cartRow.id,
    cart: buildCartState(items, (cartRow.currency || 'USD') as CurrencyCode),
  };
}

/**
 * Adds an item to the persistent PostgreSQL cart using authoritative DB offer prices & stock.
 */
export async function addCartItem(
  identity: CartIdentity,
  input: { offerId?: string; productId: string; variantId?: string; variantLabel?: string; quantity: number },
  pool?: pg.Pool
): Promise<PersistedCartResult> {
  const targetPool = pool || getDbPool();
  const qtyToAdd = Math.trunc(input.quantity);
  if (!Number.isInteger(qtyToAdd) || qtyToAdd < 1 || qtyToAdd > MAX_ITEM_QTY) {
    throw new ValidationError(`Quantity must be an integer between 1 and ${MAX_ITEM_QTY}.`);
  }

  return await withTransaction(
    async (client) => {
      const resolvedCart = await resolveOrCreateCartRow(client, identity);

      // Resolve authoritative seller offer from PostgreSQL (never trust client price!)
      const offerRes = input.offerId
        ? await client.query<any>(
            `SELECT so.*, p.is_active AS product_active
             FROM seller_offers so
             JOIN products p ON p.id = so.product_id
             WHERE so.id = $1
             LIMIT 1;`,
            [input.offerId]
          )
        : await client.query<any>(
            `SELECT so.*, p.is_active AS product_active
             FROM seller_offers so
             JOIN products p ON p.id = so.product_id
             WHERE so.product_id = $1
             ORDER BY so.is_buy_box_winner DESC, so.price_minor ASC
             LIMIT 1;`,
            [input.productId]
          );

      if (offerRes.rows.length === 0) {
        throw new NotFoundError('Requested product or seller offer does not exist.');
      }

      const offer = offerRes.rows[0];
      if (!offer.product_active) {
        throw new ValidationError('This product is currently unavailable.');
      }
      if (offer.product_id !== input.productId) {
        throw new ValidationError('Offer does not belong to the specified product.');
      }

      const available = Number(offer.stock_quantity) - Number(offer.reserved_quantity || 0);
      if (available <= 0) {
        throw new ConflictError('This seller offer is currently out of stock.');
      }

      const existingItems = await loadCartItemsWithClient(client, resolvedCart.cartId);
      const offerCurrency = (offer.currency || 'USD') as CurrencyCode;

      if (existingItems.length > 0 && resolvedCart.currency !== offerCurrency) {
        throw new ValidationError(
          `Currency mismatch: cart uses ${resolvedCart.currency}, but offer uses ${offerCurrency}.`
        );
      }

      if (existingItems.length === 0 && resolvedCart.currency !== offerCurrency) {
        await client.query('UPDATE carts SET currency = $2 WHERE id = $1;', [
          resolvedCart.cartId,
          offerCurrency,
        ]);
        resolvedCart.currency = offerCurrency;
      }

      const variantId = (input.variantId || 'default').trim();
      const existingLine = await client.query<{ id: string; quantity: number }>(
        `SELECT id, quantity FROM cart_items
         WHERE cart_id = $1 AND offer_id = $2 AND variant_id = $3
         FOR UPDATE;`,
        [resolvedCart.cartId, offer.id, variantId]
      );

      const newQuantity = (existingLine.rows[0]?.quantity || 0) + qtyToAdd;
      if (newQuantity > MAX_ITEM_QTY) {
        throw new ValidationError(`Maximum quantity per cart line is ${MAX_ITEM_QTY}.`);
      }
      if (newQuantity > available) {
        throw new ConflictError(`Only ${available} unit(s) available in stock for this offer.`);
      }

      if (existingLine.rows.length > 0) {
        await client.query(
          `UPDATE cart_items
           SET quantity = $2, unit_price_minor = $3, updated_at = NOW()
           WHERE id = $1;`,
          [existingLine.rows[0]!.id, newQuantity, offer.price_minor]
        );
      } else {
        await client.query(
          `INSERT INTO cart_items (
             id, cart_id, product_id, offer_id, seller_id,
             variant_id, variant_label, quantity, unit_price_minor, currency
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
          [
            `ci-${crypto.randomUUID().slice(0, 12)}`,
            resolvedCart.cartId,
            offer.product_id,
            offer.id,
            offer.seller_id,
            variantId,
            input.variantLabel || null,
            qtyToAdd,
            offer.price_minor,
            offerCurrency,
          ]
        );
      }

      await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1;', [resolvedCart.cartId]);
      const items = await loadCartItemsWithClient(client, resolvedCart.cartId);

      return {
        cartId: resolvedCart.cartId,
        cart: buildCartState(items, resolvedCart.currency),
        newGuestToken: resolvedCart.newGuestToken,
      };
    },
    undefined,
    targetPool
  );
}

/**
 * Updates quantity for an item in the persisted cart (or deletes if quantity <= 0).
 */
export async function updateCartLineQuantity(
  identity: CartIdentity,
  itemId: string,
  quantity: number,
  pool?: pg.Pool
): Promise<PersistedCartResult> {
  const targetPool = pool || getDbPool();
  const cleanQty = Math.trunc(quantity);

  return await withTransaction(
    async (client) => {
      const resolved = await resolveOrCreateCartRow(client, identity);

      const lineRes = await client.query<any>(
        `SELECT ci.id, ci.offer_id, so.stock_quantity, so.reserved_quantity, so.price_minor
         FROM cart_items ci
         JOIN seller_offers so ON so.id = ci.offer_id
         WHERE ci.id = $1 AND ci.cart_id = $2
         FOR UPDATE;`,
        [itemId, resolved.cartId]
      );

      if (lineRes.rows.length === 0) {
        throw new NotFoundError('Cart item not found.');
      }

      if (cleanQty <= 0) {
        await client.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2;', [
          itemId,
          resolved.cartId,
        ]);
      } else {
        if (cleanQty > MAX_ITEM_QTY) {
          throw new ValidationError(`Maximum quantity per item is ${MAX_ITEM_QTY}.`);
        }
        const row = lineRes.rows[0];
        const available = Number(row.stock_quantity) - Number(row.reserved_quantity || 0);
        if (cleanQty > available) {
          throw new ConflictError(`Only ${available} unit(s) available in stock.`);
        }

        await client.query(
          `UPDATE cart_items
           SET quantity = $2, unit_price_minor = $3, updated_at = NOW()
           WHERE id = $1;`,
          [itemId, cleanQty, row.price_minor]
        );
      }

      await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1;', [resolved.cartId]);
      const items = await loadCartItemsWithClient(client, resolved.cartId);

      return {
        cartId: resolved.cartId,
        cart: buildCartState(items, resolved.currency),
        newGuestToken: resolved.newGuestToken,
      };
    },
    undefined,
    targetPool
  );
}

/**
 * Removes an item from the persisted cart.
 */
export async function removeCartLine(
  identity: CartIdentity,
  itemId: string,
  pool?: pg.Pool
): Promise<PersistedCartResult> {
  return updateCartLineQuantity(identity, itemId, 0, pool);
}

/**
 * Clears all items from the persisted cart.
 */
export async function clearPersistedCart(
  identity: CartIdentity,
  pool?: pg.Pool
): Promise<PersistedCartResult> {
  const targetPool = pool || getDbPool();
  return await withTransaction(
    async (client) => {
      const resolved = await resolveOrCreateCartRow(client, identity);
      await client.query('DELETE FROM cart_items WHERE cart_id = $1;', [resolved.cartId]);
      await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1;', [resolved.cartId]);
      return {
        cartId: resolved.cartId,
        cart: buildCartState([], resolved.currency),
        newGuestToken: resolved.newGuestToken,
      };
    },
    undefined,
    targetPool
  );
}

/**
 * Merges an anonymous guest cart into an authenticated customer's persistent cart atomically.
 */
export async function mergeGuestCartIntoCustomerCart(
  guestToken: string | null | undefined,
  customerId: string,
  pool?: pg.Pool
): Promise<void> {
  if (!guestToken) return;
  const targetPool = pool || getDbPool();
  const guestHash = hashToken(guestToken);

  await withTransaction(
    async (client) => {
      const guestCartRes = await client.query<{ id: string }>(
        `SELECT id FROM carts
         WHERE guest_token_hash = $1 AND status = 'active' AND expires_at > NOW()
         FOR UPDATE;`,
        [guestHash]
      );
      if (guestCartRes.rows.length === 0) return;

      const guestCartId = guestCartRes.rows[0]!.id;
      const guestItemsRes = await client.query<any>(
        `SELECT ci.*, so.stock_quantity, so.reserved_quantity, so.price_minor
         FROM cart_items ci
         JOIN seller_offers so ON so.id = ci.offer_id
         WHERE ci.cart_id = $1;`,
        [guestCartId]
      );

      if (guestItemsRes.rows.length > 0) {
        const customerCart = await resolveOrCreateCartRow(client, { customerId });

        for (const gi of guestItemsRes.rows) {
          const available = Math.max(0, Number(gi.stock_quantity) - Number(gi.reserved_quantity || 0));
          if (available <= 0) continue;

          const existing = await client.query<{ id: string; quantity: number }>(
            `SELECT id, quantity FROM cart_items
             WHERE cart_id = $1 AND offer_id = $2 AND variant_id = $3
             FOR UPDATE;`,
            [customerCart.cartId, gi.offer_id, gi.variant_id || 'default']
          );

          const desiredQty = Math.min(
            MAX_ITEM_QTY,
            available,
            (existing.rows[0]?.quantity || 0) + Number(gi.quantity)
          );

          if (existing.rows.length > 0) {
            await client.query(
              `UPDATE cart_items
               SET quantity = $2, unit_price_minor = $3, updated_at = NOW()
               WHERE id = $1;`,
              [existing.rows[0]!.id, desiredQty, gi.price_minor]
            );
          } else {
            await client.query(
              `INSERT INTO cart_items (
                 id, cart_id, product_id, offer_id, seller_id,
                 variant_id, variant_label, quantity, unit_price_minor, currency
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
              [
                `ci-${crypto.randomUUID().slice(0, 12)}`,
                customerCart.cartId,
                gi.product_id,
                gi.offer_id,
                gi.seller_id,
                gi.variant_id || 'default',
                gi.variant_label || null,
                desiredQty,
                gi.price_minor,
                gi.currency || 'USD',
              ]
            );
          }
        }
      }

      await client.query(
        `UPDATE carts SET status = 'merged', updated_at = NOW() WHERE id = $1;`,
        [guestCartId]
      );
    },
    undefined,
    targetPool
  );
}
