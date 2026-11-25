import crypto from 'node:crypto';
import type pg from 'pg';
import { getDbPool, withTransaction } from '@/server/db/client';
import {
  confirmOrderReservationsInTx,
  releaseOrderReservationsInTx,
} from './inventory-service';
import { ConflictError, ForbiddenError, NotFoundError } from '@/server/security/http';

export type OrderLifecycleStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'partially_shipped'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'partially_refunded'
  | 'refunded';

export type PackageLifecycleStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderLifecycleStatus, OrderLifecycleStatus[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['partially_shipped', 'shipped', 'cancelled'],
  partially_shipped: ['shipped', 'delivered', 'partially_refunded'],
  shipped: ['delivered', 'partially_refunded', 'refunded'],
  delivered: ['partially_refunded', 'refunded'],
  cancelled: [],
  partially_refunded: ['refunded'],
  refunded: [],
};

export const ALLOWED_PACKAGE_TRANSITIONS: Record<PackageLifecycleStatus, PackageLifecycleStatus[]> = {
  pending: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

/**
 * Transitions an order status with explicit validation, inventory lifecycle hooks, and audit history.
 */
export async function transitionOrderLifecycle(
  params: {
    orderId: string;
    targetStatus: OrderLifecycleStatus;
    actorId: string;
    actorRole: string;
    reason?: string;
  },
  pool?: pg.Pool
): Promise<{ previousStatus: string; newStatus: OrderLifecycleStatus }> {
  const targetPool = pool || getDbPool();

  return await withTransaction(
    async (client) => {
      const orderRes = await client.query<{ status: string; payment_status: string }>(
        'SELECT status, payment_status FROM orders WHERE id = $1 FOR UPDATE;',
        [params.orderId]
      );

      if (orderRes.rows.length === 0) {
        throw new NotFoundError(`Order ${params.orderId} not found.`);
      }

      const currentStatus = (orderRes.rows[0]!.status || 'pending_payment') as OrderLifecycleStatus;
      const allowed = ALLOWED_ORDER_TRANSITIONS[currentStatus] || [];

      if (!allowed.includes(params.targetStatus)) {
        throw new ConflictError(
          `Invalid order status transition from "${currentStatus}" to "${params.targetStatus}".`
        );
      }

      let nextPaymentStatus = orderRes.rows[0]!.payment_status;
      if (params.targetStatus === 'confirmed') {
        await confirmOrderReservationsInTx(client, params.orderId, params.actorId);
        nextPaymentStatus = 'paid';
      } else if (params.targetStatus === 'cancelled') {
        await releaseOrderReservationsInTx(
          client,
          params.orderId,
          params.actorId,
          params.reason || 'Order cancelled',
          'released'
        );
        // Restore confirmed stock if items had already been deducted directly
        if (currentStatus === 'confirmed' || currentStatus === 'processing') {
          const itemsRes = await client.query<{ offer_id: string | null; quantity: number }>(
            'SELECT offer_id, quantity FROM order_items WHERE order_id = $1;',
            [params.orderId]
          );
          for (const it of itemsRes.rows) {
            if (it.offer_id) {
              await client.query(
                `UPDATE seller_offers
                 SET stock_quantity = stock_quantity + $1,
                     inventory_state = 'in_stock',
                     updated_at = NOW()
                 WHERE id = $2;`,
                [it.quantity, it.offer_id]
              );
            }
          }
        }
        nextPaymentStatus = 'failed';
      }

      await client.query(
        `UPDATE orders
         SET status = $2, payment_status = $3, updated_at = NOW()
         WHERE id = $1;`,
        [params.orderId, params.targetStatus, nextPaymentStatus]
      );

      await client.query(
        `INSERT INTO order_status_history (
           id, order_id, scope, previous_status, new_status, actor_id, actor_role, reason
         ) VALUES ($1, $2, 'order', $3, $4, $5, $6, $7);`,
        [
          `osh-${crypto.randomUUID().slice(0, 12)}`,
          params.orderId,
          currentStatus,
          params.targetStatus,
          params.actorId,
          params.actorRole,
          params.reason || null,
        ]
      );

      await client.query(
        `INSERT INTO audit_logs (
           id, actor_id, actor_name, actor_role, action, target_type, target_id, metadata, outcome
         ) VALUES ($1, $2, $3, $4, 'ORDER_LIFECYCLE_TRANSITION', 'order', $5, $6, 'success');`,
        [
          `aud-${crypto.randomUUID().slice(0, 12)}`,
          params.actorId,
          params.actorId,
          params.actorRole,
          params.orderId,
          JSON.stringify({ previousStatus: currentStatus, newStatus: params.targetStatus, reason: params.reason }),
        ]
      );

      return { previousStatus: currentStatus, newStatus: params.targetStatus };
    },
    undefined,
    targetPool
  );
}

/**
 * Transitions a seller fulfillment package status, enforcing seller ownership & valid state transitions,
 * and recalculating parent order fulfillment state automatically.
 */
export async function transitionSellerPackageLifecycle(
  params: {
    packageId: string;
    sellerId: string;
    targetStatus: PackageLifecycleStatus;
    carrier?: string;
    trackingNumber?: string;
    actorId: string;
  },
  pool?: pg.Pool
): Promise<any> {
  const targetPool = pool || getDbPool();

  return await withTransaction(
    async (client) => {
      const pkgRes = await client.query<any>(
        'SELECT * FROM seller_packages WHERE id = $1 FOR UPDATE;',
        [params.packageId]
      );

      if (pkgRes.rows.length === 0) {
        throw new NotFoundError(`Seller package ${params.packageId} not found.`);
      }

      const pkg = pkgRes.rows[0];
      if (pkg.seller_id !== params.sellerId) {
        throw new ForbiddenError('Cannot update fulfillment package belonging to another seller.');
      }

      const currentStatus = (pkg.status || 'pending') as PackageLifecycleStatus;
      const allowed = ALLOWED_PACKAGE_TRANSITIONS[currentStatus] || [];

      if (!allowed.includes(params.targetStatus)) {
        throw new ConflictError(
          `Invalid package fulfillment transition from "${currentStatus}" to "${params.targetStatus}".`
        );
      }

      const nextCarrier = params.carrier ?? pkg.carrier;
      const nextTracking = params.trackingNumber ?? pkg.tracking_number;

      const updatedPkgRes = await client.query(
        `UPDATE seller_packages
         SET status = $2::text,
             fulfillment_status = $2::text,
             carrier = $3,
             tracking_number = $4,
             dispatched_at = CASE WHEN $2::text = 'shipped' THEN COALESCE(dispatched_at, NOW()) ELSE dispatched_at END,
             delivered_at = CASE WHEN $2::text = 'delivered' THEN COALESCE(delivered_at, NOW()) ELSE delivered_at END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [params.packageId, params.targetStatus, nextCarrier, nextTracking]
      );

      // Update order_items linked to this package
      await client.query(
        `UPDATE order_items
         SET fulfillment_status = $2, carrier = $3, tracking_number = $4
         WHERE order_id = $1 AND seller_id = $5;`,
        [pkg.order_id, params.targetStatus, nextCarrier, nextTracking, pkg.seller_id]
      );

      // Derive parent order aggregate fulfillment status
      const siblingPkgs = await client.query<{ status: string }>(
        'SELECT status FROM seller_packages WHERE order_id = $1;',
        [pkg.order_id]
      );

      const statuses = siblingPkgs.rows.map((r) => r.status);
      let derivedOrderStatus: string | null = null;
      let derivedFulfillment = 'unfulfilled';

      if (statuses.every((s) => s === 'delivered')) {
        derivedOrderStatus = 'delivered';
        derivedFulfillment = 'fulfilled';
      } else if (statuses.every((s) => s === 'shipped' || s === 'delivered')) {
        derivedOrderStatus = 'shipped';
        derivedFulfillment = 'fulfilled';
      } else if (statuses.some((s) => s === 'shipped' || s === 'delivered')) {
        derivedOrderStatus = 'partially_shipped';
        derivedFulfillment = 'partially_fulfilled';
      } else if (statuses.some((s) => s === 'processing')) {
        derivedOrderStatus = 'processing';
      }

      if (derivedOrderStatus) {
        await client.query(
          `UPDATE orders
           SET status = CASE WHEN status IN ('cancelled', 'refunded') THEN status ELSE $2 END,
               fulfillment_status = $3,
               carrier = COALESCE($4, carrier),
               tracking_number = COALESCE($5, tracking_number),
               updated_at = NOW()
           WHERE id = $1;`,
          [pkg.order_id, derivedOrderStatus, derivedFulfillment, nextCarrier, nextTracking]
        );
      }

      await client.query(
        `INSERT INTO order_status_history (
           id, order_id, package_id, scope, previous_status, new_status, actor_id, actor_role, reason
         ) VALUES ($1, $2, $3, 'package', $4, $5, $6, 'seller', $7);`,
        [
          `osh-${crypto.randomUUID().slice(0, 12)}`,
          pkg.order_id,
          params.packageId,
          currentStatus,
          params.targetStatus,
          params.actorId,
          nextTracking ? `Updated tracking: ${nextTracking}` : null,
        ]
      );

      return updatedPkgRes.rows[0];
    },
    undefined,
    targetPool
  );
}
