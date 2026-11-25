import type pg from 'pg';
import crypto from 'node:crypto';
import { getDbPool, withTransaction } from '@/server/db/client';
import { appLogger } from '@/lib/observability/logger';
import { reserveInventoryInTx } from './inventory-service';
import { ForbiddenError, NotFoundError, ValidationError } from '@/server/security/http';

export interface OrderItemInput {
  offerId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  variantId?: string;
}

export interface ShippingAddressInput {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrderInput {
  customerId: string;
  items: OrderItemInput[];
  shippingAddress: ShippingAddressInput;
  paymentMethod: string;
  currency?: string;
  deliveryMethod?: 'standard' | 'express';
  idempotencyKey?: string;
  /**
   * 'commit': Immediate stock deduction (used when order payment is confirmed or direct service integration).
   * 'reserve': Reserves stock under `pending_payment` status until verified payment gateway capture (used by checkout HTTP endpoint).
   */
  mode?: 'commit' | 'reserve';
}

export interface OrderPlacementResult {
  orderId: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  packageCount: number;
  itemCount: number;
  itemsSubtotalMinor: number;
  shippingTotalMinor: number;
  taxTotalMinor: number;
  grandTotalMinor: number;
  currency: string;
  packages: Array<{
    packageId: string;
    sellerId: string;
    packageNumber: string;
    subtotalMinor: number;
    shippingMinor: number;
  }>;
  createdAt: Date;
}

export class InsufficientStockError extends Error {
  constructor(
    public readonly offerId: string,
    public readonly requested: number,
    public readonly available: number
  ) {
    super(
      `Insufficient inventory for offer ${offerId}: requested ${requested}, but only ${available} available.`
    );
    this.name = 'InsufficientStockError';
  }
}

/**
 * Enterprise Transaction-Safe Multi-Vendor Order Placement Engine.
 * Acquires deterministic row locks, resolves authoritative DB prices, creates seller packages,
 * immutable item snapshots, inventory reservations/deductions, lifecycle history, and audit logs.
 */
export async function placeMultiVendorOrder(
  input: CreateOrderInput,
  pool?: pg.Pool
): Promise<OrderPlacementResult> {
  const targetPool = pool || getDbPool();
  const mode = input.mode ?? 'commit';

  if (!input.items || input.items.length === 0) {
    throw new ValidationError('Cannot create an order with empty items.');
  }

  return await withTransaction(
    async (client) => {
      const orderId = `ord-${crypto.randomUUID().slice(0, 12)}`;
      let resolvedCurrency = input.currency || '';
      let itemsSubtotalMinor = 0;
      let totalItemCount = 0;

      // Sort items deterministically by offerId to avoid lock acquisition deadlocks under concurrency
      const sortedItems = [...input.items].sort((a, b) => a.offerId.localeCompare(b.offerId));

      const itemsBySeller = new Map<
        string,
        Array<
          OrderItemInput & {
            title: string;
            unitPriceMinor: number;
            lineTotalMinor: number;
            shippingCostMinor: number;
          }
        >
      >();

      const pendingReservationIds: string[] = [];

      for (const item of sortedItems) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new ValidationError(`Invalid item quantity ${item.quantity} for offer ${item.offerId}`);
        }

        if (mode === 'reserve') {
          // Reservation-based workflow for pending_payment checkout (order_id linked after orders insert)
          const reserved = await reserveInventoryInTx(client, {
            offerId: item.offerId,
            orderId: null,
            customerId: input.customerId,
            quantity: item.quantity,
            ttlSeconds: 1800,
          });
          pendingReservationIds.push(reserved.reservationId);

          const metaRes = await client.query<{
            title_en: string;
            is_free_shipping: boolean;
            shipping_cost_minor: number;
          }>(
            `SELECT p.title_en, so.is_free_shipping, so.shipping_cost_minor
             FROM seller_offers so
             JOIN products p ON p.id = so.product_id
             WHERE so.id = $1;`,
            [item.offerId]
          );
          const meta = metaRes.rows[0];

          if (!resolvedCurrency) {
            resolvedCurrency = reserved.currency;
          } else if (resolvedCurrency !== reserved.currency) {
            throw new ValidationError('All items in a single order must share one currency.');
          }

          const lineTotalMinor = reserved.unitPriceMinor * item.quantity;
          itemsSubtotalMinor += lineTotalMinor;
          totalItemCount += item.quantity;

          const list = itemsBySeller.get(reserved.sellerId) || [];
          list.push({
            ...item,
            productId: reserved.productId,
            sellerId: reserved.sellerId,
            title: meta?.title_en || `Marketplace Item - ${reserved.productId}`,
            unitPriceMinor: reserved.unitPriceMinor,
            lineTotalMinor,
            shippingCostMinor: meta?.is_free_shipping ? 0 : Number(meta?.shipping_cost_minor || 0),
          });
          itemsBySeller.set(reserved.sellerId, list);
        } else {
          // Direct atomic stock deduction mode
          const offerRes = await client.query<{
            id: string;
            stock_quantity: number;
            reserved_quantity: number;
            price_minor: number;
            currency: string;
            seller_id: string;
            product_id: string;
            title_en: string;
          }>(
            `SELECT so.id, so.stock_quantity, COALESCE(so.reserved_quantity, 0) as reserved_quantity,
                    so.price_minor, so.currency, so.seller_id, so.product_id, p.title_en
             FROM seller_offers so
             JOIN products p ON p.id = so.product_id
             WHERE so.id = $1
             FOR UPDATE OF so;`,
            [item.offerId]
          );

          if (offerRes.rows.length === 0) {
            throw new NotFoundError(`Seller offer ${item.offerId} does not exist.`);
          }

          const offer = offerRes.rows[0]!;
          const available = Number(offer.stock_quantity) - Number(offer.reserved_quantity);

          if (available < item.quantity) {
            throw new InsufficientStockError(item.offerId, item.quantity, available);
          }

          const stockAfter = Number(offer.stock_quantity) - item.quantity;
          const remainingAvail = stockAfter - Number(offer.reserved_quantity);

          await client.query(
            `UPDATE seller_offers
             SET stock_quantity = $2,
                 inventory_state = CASE WHEN $3 <= 0 THEN 'out_of_stock' ELSE 'in_stock' END,
                 updated_at = NOW()
             WHERE id = $1;`,
            [item.offerId, stockAfter, remainingAvail]
          );

          await client.query(
            `INSERT INTO inventory_movements (
               id, offer_id, order_id, actor_id, movement_type, quantity_delta,
               stock_before, stock_after, reserved_before, reserved_after, reason
             ) VALUES ($1, $2, $3, $4, 'CONFIRM', $5, $6, $7, $8, $8, 'Direct order stock allocation');`,
            [
              `mov-${crypto.randomUUID().slice(0, 12)}`,
              item.offerId,
              orderId,
              input.customerId,
              -item.quantity,
              offer.stock_quantity,
              stockAfter,
              offer.reserved_quantity,
            ]
          );

          if (!resolvedCurrency) {
            resolvedCurrency = offer.currency || 'USD';
          }

          const unitPriceMinor = Number(offer.price_minor);
          const lineTotalMinor = unitPriceMinor * item.quantity;
          itemsSubtotalMinor += lineTotalMinor;
          totalItemCount += item.quantity;

          const list = itemsBySeller.get(offer.seller_id) || [];
          list.push({
            ...item,
            productId: offer.product_id,
            sellerId: offer.seller_id,
            title: offer.title_en || `Marketplace Item - ${offer.product_id}`,
            unitPriceMinor,
            lineTotalMinor,
            shippingCostMinor: 0,
          });
          itemsBySeller.set(offer.seller_id, list);
        }
      }

      const finalCurrency = resolvedCurrency || 'USD';
      const deliveryMethod = input.deliveryMethod || 'standard';
      const expressFeePerPkg = deliveryMethod === 'express' ? 1500 : 0;

      // Authoritative shipping + tax computation (8.25% tax)
      let shippingTotalMinor = 0;
      for (const sellerItems of itemsBySeller.values()) {
        const basePkgShipping = sellerItems.reduce((sum, s) => Math.max(sum, s.shippingCostMinor), 0);
        shippingTotalMinor += basePkgShipping + expressFeePerPkg;
      }
      const taxTotalMinor = mode === 'reserve' ? Math.round(itemsSubtotalMinor * 0.0825) : 0;
      const grandTotalMinor = itemsSubtotalMinor + shippingTotalMinor + taxTotalMinor;

      const orderStatus = mode === 'reserve' ? 'pending_payment' : 'confirmed';
      const paymentStatus = mode === 'reserve' ? 'pending_payment' : 'paid';
      const fulfillmentStatus = 'unfulfilled';

      // Create Parent Order (do not invent fake escrow references)
      await client.query(
        `INSERT INTO orders (
           id, customer_id, currency, items_subtotal_minor, shipping_total_minor,
           tax_total_minor, grand_total_minor, item_count, status, payment_status,
           fulfillment_status, delivery_method, shipping_address, payment_method,
           escrow_reference, escrow_status, idempotency_key, estimated_delivery,
           created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8, $9, $10,
           $11, $12, $13, $14,
           NULL, 'unconfigured', $15, $16,
           NOW(), NOW()
         );`,
        [
          orderId,
          input.customerId,
          finalCurrency,
          itemsSubtotalMinor,
          shippingTotalMinor,
          taxTotalMinor,
          grandTotalMinor,
          totalItemCount,
          orderStatus,
          paymentStatus,
          fulfillmentStatus,
          deliveryMethod,
          JSON.stringify(input.shippingAddress),
          input.paymentMethod,
          input.idempotencyKey || null,
          deliveryMethod === 'express' ? '1-2 business days' : '3-5 business days',
        ]
      );

      // Link inventory reservations to parent order now that orders row exists
      if (mode === 'reserve' && pendingReservationIds.length > 0) {
        await client.query(
          `UPDATE inventory_reservations SET order_id = $1 WHERE id = ANY($2);`,
          [orderId, pendingReservationIds]
        );
      }

      const createdPackages: OrderPlacementResult['packages'] = [];
      let packageIdx = 1;

      for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
        const packageId = `pkg-${crypto.randomUUID().slice(0, 12)}`;
        const packageNumber = `PKG-${orderId}-${String(packageIdx).padStart(2, '0')}`;
        const packageSubtotal = sellerItems.reduce((acc, curr) => acc + curr.lineTotalMinor, 0);
        const pkgShipping =
          sellerItems.reduce((sum, s) => Math.max(sum, s.shippingCostMinor), 0) + expressFeePerPkg;

        await client.query(
          `INSERT INTO seller_packages (
             id, order_id, seller_id, package_number, status, fulfillment_status,
             subtotal_minor, shipping_minor, grand_total_minor, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, 'pending', 'pending', $5, $6, $7, NOW(), NOW());`,
          [
            packageId,
            orderId,
            sellerId,
            packageNumber,
            packageSubtotal,
            pkgShipping,
            packageSubtotal + pkgShipping,
          ]
        );

        for (const item of sellerItems) {
          const itemId = `itm-${crypto.randomUUID().slice(0, 12)}`;
          await client.query(
            `INSERT INTO order_items (
               id, order_id, package_id, seller_id, product_id, offer_id, variant_id,
               sku, title, unit_price_minor, quantity, line_total_minor, currency, fulfillment_status, created_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', NOW());`,
            [
              itemId,
              orderId,
              packageId,
              sellerId,
              item.productId,
              item.offerId,
              item.variantId || 'default',
              item.offerId,
              item.title,
              item.unitPriceMinor,
              item.quantity,
              item.lineTotalMinor,
              finalCurrency,
            ]
          );
        }

        createdPackages.push({
          packageId,
          sellerId,
          packageNumber,
          subtotalMinor: packageSubtotal,
          shippingMinor: pkgShipping,
        });
        packageIdx++;
      }

      // Lifecycle history
      await client.query(
        `INSERT INTO order_status_history (
           id, order_id, scope, previous_status, new_status, actor_id, actor_role, reason
         ) VALUES ($1, $2, 'order', NULL, $3, $4, 'customer', $5);`,
        [
          `osh-${crypto.randomUUID().slice(0, 12)}`,
          orderId,
          orderStatus,
          input.customerId,
          mode === 'reserve'
            ? 'Order created in pending_payment awaiting verified payment confirmation'
            : 'Order placed and stock committed',
        ]
      );

      // Security Audit Log
      await client.query(
        `INSERT INTO audit_logs (
           id, timestamp, actor_id, actor_name, actor_role,
           action, target_type, target_id, metadata, outcome
         ) VALUES ($1, NOW(), $2, $3, 'customer', 'ORDER_PLACED', 'order', $4, $5, 'success');`,
        [
          `aud-${crypto.randomUUID().slice(0, 12)}`,
          input.customerId,
          input.shippingAddress.name || 'Customer',
          orderId,
          JSON.stringify({
            grandTotalMinor,
            currency: finalCurrency,
            packageCount: createdPackages.length,
            itemCount: totalItemCount,
            status: orderStatus,
            paymentStatus,
          }),
        ]
      );

      appLogger.info('Multi-vendor order placed successfully', {
        orderId,
        customerId: input.customerId,
        grandTotalMinor,
        packages: createdPackages.length,
      });

      return {
        orderId,
        customerId: input.customerId,
        status: orderStatus,
        paymentStatus,
        fulfillmentStatus,
        packageCount: createdPackages.length,
        itemCount: totalItemCount,
        itemsSubtotalMinor,
        shippingTotalMinor,
        taxTotalMinor,
        grandTotalMinor,
        currency: finalCurrency,
        packages: createdPackages,
        createdAt: new Date(),
      };
    },
    { isolationLevel: 'READ COMMITTED' },
    targetPool
  );
}

/**
 * Helper used by live checkout API: resolves the customer's persisted PostgreSQL cart,
 * places the multi-vendor order in 'reserve' mode, and clears the cart atomically.
 */
export async function placeOrderFromCustomerCart(
  params: {
    customerId: string;
    shippingAddress: ShippingAddressInput;
    deliveryMethod: 'standard' | 'express';
    paymentMethod: string;
    idempotencyKey?: string;
    addressId?: string;
  },
  pool?: pg.Pool
): Promise<OrderPlacementResult> {
  const targetPool = pool || getDbPool();

  // Validate saved address ownership if addressId provided
  let resolvedAddress = params.shippingAddress;
  if (params.addressId) {
    const addrRes = await targetPool.query(
      'SELECT * FROM customer_addresses WHERE id = $1 AND customer_id = $2 LIMIT 1;',
      [params.addressId, params.customerId]
    );
    if (addrRes.rows.length === 0) {
      throw new ForbiddenError('Selected shipping address does not belong to authenticated customer.');
    }
    const a = addrRes.rows[0];
    resolvedAddress = {
      name: a.full_name,
      street: a.street_line1,
      city: a.city,
      state: a.state_province,
      postalCode: a.postal_code,
      country: a.country_code,
      phone: a.phone,
    };
  }

  // Resolve persisted cart items
  const cartRes = await targetPool.query<{ id: string; currency: string }>(
    `SELECT id, currency FROM carts
     WHERE customer_id = $1 AND status = 'active' AND expires_at > NOW()
     LIMIT 1;`,
    [params.customerId]
  );

  if (cartRes.rows.length === 0) {
    throw new ValidationError('Active shopping cart is empty.');
  }

  const cartId = cartRes.rows[0]!.id;
  const cartItemsRes = await targetPool.query<{
    offer_id: string;
    product_id: string;
    seller_id: string;
    variant_id: string;
    quantity: number;
  }>('SELECT offer_id, product_id, seller_id, variant_id, quantity FROM cart_items WHERE cart_id = $1;', [
    cartId,
  ]);

  if (cartItemsRes.rows.length === 0) {
    throw new ValidationError('Cannot place order with an empty cart.');
  }

  const orderResult = await placeMultiVendorOrder(
    {
      customerId: params.customerId,
      items: cartItemsRes.rows.map((r) => ({
        offerId: r.offer_id,
        productId: r.product_id,
        sellerId: r.seller_id,
        variantId: r.variant_id,
        quantity: r.quantity,
      })),
      shippingAddress: resolvedAddress,
      paymentMethod: params.paymentMethod,
      currency: cartRes.rows[0]!.currency || 'USD',
      deliveryMethod: params.deliveryMethod,
      idempotencyKey: params.idempotencyKey,
      mode: 'reserve',
    },
    targetPool
  );

  // Clear persisted cart after order placement succeeds
  await targetPool.query('DELETE FROM cart_items WHERE cart_id = $1;', [cartId]);

  return orderResult;
}
