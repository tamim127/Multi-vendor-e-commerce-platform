import crypto from 'node:crypto';
import type pg from 'pg';
import { getDbPool, withTransaction } from '@/server/db/client';
import { InsufficientStockError } from './order-service';
import { ConflictError, ForbiddenError, NotFoundError } from '@/server/security/http';

/**
 * Inventory Reservation & Accounting Engine
 *
 * INVARIANTS:
 * 1. `stock_quantity` = physical stock on hand.
 * 2. `reserved_quantity` = stock currently held by active, unconfirmed reservations.
 * 3. `available_quantity` = `stock_quantity - reserved_quantity` >= 0.
 * 4. Physical stock is NEVER decremented at the same time `reserved_quantity` is incremented
 *    for the same unit (no double counting).
 */

export async function reserveInventoryInTx(
  client: pg.PoolClient,
  params: {
    offerId: string;
    orderId?: string | null;
    customerId: string;
    quantity: number;
    ttlSeconds?: number;
  }
): Promise<{ reservationId: string; unitPriceMinor: number; currency: string; sellerId: string; productId: string }> {
  const offerRes = await client.query<{
    id: string;
    product_id: string;
    seller_id: string;
    price_minor: number;
    currency: string;
    stock_quantity: number;
    reserved_quantity: number;
  }>(
    `SELECT id, product_id, seller_id, price_minor, currency, stock_quantity, reserved_quantity
     FROM seller_offers
     WHERE id = $1
     FOR UPDATE;`,
    [params.offerId]
  );

  if (offerRes.rows.length === 0) {
    throw new NotFoundError(`Seller offer ${params.offerId} does not exist.`);
  }

  const offer = offerRes.rows[0]!;
  const stockBefore = Number(offer.stock_quantity);
  const reservedBefore = Number(offer.reserved_quantity || 0);
  const available = stockBefore - reservedBefore;

  if (available < params.quantity) {
    throw new InsufficientStockError(params.offerId, params.quantity, available);
  }

  const reservedAfter = reservedBefore + params.quantity;
  const remainingAvailable = stockBefore - reservedAfter;

  await client.query(
    `UPDATE seller_offers
     SET reserved_quantity = $2,
         inventory_state = CASE WHEN $3 <= 0 THEN 'out_of_stock' WHEN $3 <= 5 THEN 'low_stock' ELSE 'in_stock' END,
         updated_at = NOW()
     WHERE id = $1;`,
    [params.offerId, reservedAfter, remainingAvailable]
  );

  const reservationId = `res-${crypto.randomUUID().slice(0, 12)}`;
  const expiresAt = new Date(Date.now() + (params.ttlSeconds ?? 1800) * 1000);

  await client.query(
    `INSERT INTO inventory_reservations (
       id, offer_id, order_id, customer_id, quantity, status, expires_at
     ) VALUES ($1, $2, $3, $4, $5, 'reserved', $6);`,
    [reservationId, params.offerId, params.orderId, params.customerId, params.quantity, expiresAt]
  );

  await client.query(
    `INSERT INTO inventory_movements (
       id, offer_id, order_id, actor_id, movement_type, quantity_delta,
       stock_before, stock_after, reserved_before, reserved_after, reason
     ) VALUES ($1, $2, $3, $4, 'RESERVE', $5, $6, $6, $7, $8, 'Checkout inventory reservation');`,
    [
      `mov-${crypto.randomUUID().slice(0, 12)}`,
      params.offerId,
      params.orderId,
      params.customerId,
      params.quantity,
      stockBefore,
      reservedBefore,
      reservedAfter,
    ]
  );

  return {
    reservationId,
    unitPriceMinor: Number(offer.price_minor),
    currency: offer.currency || 'USD',
    sellerId: offer.seller_id,
    productId: offer.product_id,
  };
}

/**
 * Confirms reservations upon payment capture: atomically moves quantities from reserved -> physical deduction.
 */
export async function confirmOrderReservationsInTx(
  client: pg.PoolClient,
  orderId: string,
  actorId: string
): Promise<number> {
  const reservations = await client.query<{ id: string; offer_id: string; quantity: number }>(
    `SELECT id, offer_id, quantity
     FROM inventory_reservations
     WHERE order_id = $1 AND status = 'reserved'
     ORDER BY offer_id ASC
     FOR UPDATE;`,
    [orderId]
  );

  let confirmedCount = 0;

  for (const resRow of reservations.rows) {
    const offerRes = await client.query<{ stock_quantity: number; reserved_quantity: number }>(
      'SELECT stock_quantity, reserved_quantity FROM seller_offers WHERE id = $1 FOR UPDATE;',
      [resRow.offer_id]
    );
    const offer = offerRes.rows[0]!;
    const stockBefore = Number(offer.stock_quantity);
    const reservedBefore = Number(offer.reserved_quantity);
    const stockAfter = Math.max(0, stockBefore - resRow.quantity);
    const reservedAfter = Math.max(0, reservedBefore - resRow.quantity);
    const availableAfter = stockAfter - reservedAfter;

    await client.query(
      `UPDATE seller_offers
       SET stock_quantity = $2,
           reserved_quantity = $3,
           inventory_state = CASE WHEN $4 <= 0 THEN 'out_of_stock' WHEN $4 <= 5 THEN 'low_stock' ELSE 'in_stock' END,
           updated_at = NOW()
       WHERE id = $1;`,
      [resRow.offer_id, stockAfter, reservedAfter, availableAfter]
    );

    await client.query(
      `UPDATE inventory_reservations
       SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
       WHERE id = $1;`,
      [resRow.id]
    );

    await client.query(
      `INSERT INTO inventory_movements (
         id, offer_id, order_id, actor_id, movement_type, quantity_delta,
         stock_before, stock_after, reserved_before, reserved_after, reason
       ) VALUES ($1, $2, $3, $4, 'CONFIRM', $5, $6, $7, $8, $9, 'Reservation confirmed');`,
      [
        `mov-${crypto.randomUUID().slice(0, 12)}`,
        resRow.offer_id,
        orderId,
        actorId,
        -resRow.quantity,
        stockBefore,
        stockAfter,
        reservedBefore,
        reservedAfter,
      ]
    );

    confirmedCount += 1;
  }

  return confirmedCount;
}

/**
 * Releases active reservations (on payment failure, order cancellation, or expiry).
 */
export async function releaseOrderReservationsInTx(
  client: pg.PoolClient,
  orderId: string,
  actorId: string,
  reason: string,
  targetStatus: 'released' | 'expired' = 'released'
): Promise<number> {
  const reservations = await client.query<{ id: string; offer_id: string; quantity: number }>(
    `SELECT id, offer_id, quantity
     FROM inventory_reservations
     WHERE order_id = $1 AND status = 'reserved'
     ORDER BY offer_id ASC
     FOR UPDATE;`,
    [orderId]
  );

  let count = 0;

  for (const resRow of reservations.rows) {
    const offerRes = await client.query<{ stock_quantity: number; reserved_quantity: number }>(
      'SELECT stock_quantity, reserved_quantity FROM seller_offers WHERE id = $1 FOR UPDATE;',
      [resRow.offer_id]
    );
    const offer = offerRes.rows[0]!;
    const stockBefore = Number(offer.stock_quantity);
    const reservedBefore = Number(offer.reserved_quantity);
    const reservedAfter = Math.max(0, reservedBefore - resRow.quantity);
    const availableAfter = stockBefore - reservedAfter;

    await client.query(
      `UPDATE seller_offers
       SET reserved_quantity = $2,
           inventory_state = CASE WHEN $3 <= 0 THEN 'out_of_stock' WHEN $3 <= 5 THEN 'low_stock' ELSE 'in_stock' END,
           updated_at = NOW()
       WHERE id = $1;`,
      [resRow.offer_id, reservedAfter, availableAfter]
    );

    await client.query(
      `UPDATE inventory_reservations
       SET status = $2, released_at = NOW(), updated_at = NOW()
       WHERE id = $1;`,
      [resRow.id, targetStatus]
    );

    await client.query(
      `INSERT INTO inventory_movements (
         id, offer_id, order_id, actor_id, movement_type, quantity_delta,
         stock_before, stock_after, reserved_before, reserved_after, reason
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10);`,
      [
        `mov-${crypto.randomUUID().slice(0, 12)}`,
        resRow.offer_id,
        orderId,
        actorId,
        targetStatus === 'expired' ? 'EXPIRE' : 'RELEASE',
        resRow.quantity,
        stockBefore,
        reservedBefore,
        reservedAfter,
        reason,
      ]
    );

    count += 1;
  }

  return count;
}

/**
 * Releases all expired inventory reservations across the database safely.
 */
export async function expireStaleReservations(pool?: pg.Pool): Promise<number> {
  const targetPool = pool || getDbPool();
  return await withTransaction(
    async (client) => {
      const expired = await client.query<{ id: string; offer_id: string; order_id: string | null; quantity: number }>(
        `SELECT id, offer_id, order_id, quantity
         FROM inventory_reservations
         WHERE status = 'reserved' AND expires_at <= NOW()
         ORDER BY offer_id ASC
         FOR UPDATE;`
      );

      let expiredCount = 0;
      for (const row of expired.rows) {
        const offerRes = await client.query<{ stock_quantity: number; reserved_quantity: number }>(
          'SELECT stock_quantity, reserved_quantity FROM seller_offers WHERE id = $1 FOR UPDATE;',
          [row.offer_id]
        );
        if (offerRes.rows.length === 0) continue;

        const offer = offerRes.rows[0]!;
        const stockBefore = Number(offer.stock_quantity);
        const reservedBefore = Number(offer.reserved_quantity);
        const reservedAfter = Math.max(0, reservedBefore - row.quantity);
        const availableAfter = stockBefore - reservedAfter;

        await client.query(
          `UPDATE seller_offers
           SET reserved_quantity = $2,
               inventory_state = CASE WHEN $3 <= 0 THEN 'out_of_stock' WHEN $3 <= 5 THEN 'low_stock' ELSE 'in_stock' END,
               updated_at = NOW()
           WHERE id = $1;`,
          [row.offer_id, reservedAfter, availableAfter]
        );

        await client.query(
          `UPDATE inventory_reservations
           SET status = 'expired', released_at = NOW(), updated_at = NOW()
           WHERE id = $1;`,
          [row.id]
        );

        await client.query(
          `INSERT INTO inventory_movements (
             id, offer_id, order_id, actor_id, movement_type, quantity_delta,
             stock_before, stock_after, reserved_before, reserved_after, reason
           ) VALUES ($1, $2, $3, 'system', 'EXPIRE', $4, $5, $5, $6, $7, 'Reservation TTL expired');`,
          [
            `mov-${crypto.randomUUID().slice(0, 12)}`,
            row.offer_id,
            row.order_id,
            row.quantity,
            stockBefore,
            reservedBefore,
            reservedAfter,
          ]
        );

        if (row.order_id) {
          await client.query(
            `UPDATE orders
             SET status = 'cancelled', payment_status = 'failed', updated_at = NOW()
             WHERE id = $1 AND status = 'pending_payment';`,
            [row.order_id]
          );
        }

        expiredCount += 1;
      }

      return expiredCount;
    },
    undefined,
    targetPool
  );
}

/**
 * Seller stock adjustment with strict ownership check and audit movement record.
 */
export async function adjustSellerOfferStock(
  params: {
    offerId: string;
    sellerId: string;
    actorId: string;
    delta: number;
    reason: string;
  },
  pool?: pg.Pool
): Promise<{ stockQuantity: number; reservedQuantity: number; availableQuantity: number }> {
  const targetPool = pool || getDbPool();

  return await withTransaction(
    async (client) => {
      const offerRes = await client.query<{
        seller_id: string;
        stock_quantity: number;
        reserved_quantity: number;
      }>(
        'SELECT seller_id, stock_quantity, reserved_quantity FROM seller_offers WHERE id = $1 FOR UPDATE;',
        [params.offerId]
      );

      if (offerRes.rows.length === 0) {
        throw new NotFoundError('Seller offer not found.');
      }

      const offer = offerRes.rows[0]!;
      if (offer.seller_id !== params.sellerId) {
        throw new ForbiddenError('Cannot modify inventory belonging to another seller.');
      }

      const stockBefore = Number(offer.stock_quantity);
      const reservedBefore = Number(offer.reserved_quantity || 0);
      const stockAfter = stockBefore + Math.trunc(params.delta);

      if (stockAfter < reservedBefore) {
        throw new ConflictError(
          `Cannot reduce physical stock (${stockAfter}) below active reserved quantity (${reservedBefore}).`
        );
      }

      const availableAfter = stockAfter - reservedBefore;

      await client.query(
        `UPDATE seller_offers
         SET stock_quantity = $2,
             inventory_state = CASE WHEN $3 <= 0 THEN 'out_of_stock' WHEN $3 <= 5 THEN 'low_stock' ELSE 'in_stock' END,
             updated_at = NOW()
         WHERE id = $1;`,
        [params.offerId, stockAfter, availableAfter]
      );

      await client.query(
        `INSERT INTO inventory_movements (
           id, offer_id, actor_id, movement_type, quantity_delta,
           stock_before, stock_after, reserved_before, reserved_after, reason
         ) VALUES ($1, $2, $3, 'ADJUST', $4, $5, $6, $7, $7, $8);`,
        [
          `mov-${crypto.randomUUID().slice(0, 12)}`,
          params.offerId,
          params.actorId,
          Math.trunc(params.delta),
          stockBefore,
          stockAfter,
          reservedBefore,
          params.reason,
        ]
      );

      return {
        stockQuantity: stockAfter,
        reservedQuantity: reservedBefore,
        availableQuantity: availableAfter,
      };
    },
    undefined,
    targetPool
  );
}
