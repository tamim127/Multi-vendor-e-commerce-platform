import type pg from 'pg';
import crypto from 'node:crypto';
import { getDbPool, withTransaction } from '@/server/db/client';
import { appLogger } from '@/lib/observability/logger';

export interface OrderItemInput {
  offerId: string;
  productId: string;
  sellerId: string;
  quantity: number;
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
}

export interface OrderPlacementResult {
  orderId: string;
  customerId: string;
  packageCount: number;
  itemCount: number;
  grandTotalMinor: number;
  currency: string;
  packages: Array<{
    packageId: string;
    sellerId: string;
    packageNumber: string;
    subtotalMinor: number;
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
 * Guarantees atomicity across inventory reservation, vendor package routing,
 * order line creation, and security audit log generation.
 */
export async function placeMultiVendorOrder(
  input: CreateOrderInput,
  pool?: pg.Pool
): Promise<OrderPlacementResult> {
  const targetPool = pool || getDbPool();

  if (!input.items || input.items.length === 0) {
    throw new Error('Cannot create an order with empty items.');
  }

  return await withTransaction(
    async (client) => {
      const orderId = `ord-${crypto.randomUUID().slice(0, 12)}`;
      const orderCurrency = input.currency || 'USD';
      let grandTotalMinor = 0;
      let totalItemCount = 0;

      // Map items by seller to create vendor fulfillment packages
      const itemsBySeller = new Map<string, Array<OrderItemInput & { unitPriceMinor: number; lineTotalMinor: number }>>();

      // 1. Lock and verify inventory for every item with pessimistic concurrency control (FOR UPDATE)
      for (const item of input.items) {
        if (item.quantity <= 0) {
          throw new Error(`Invalid item quantity ${item.quantity} for offer ${item.offerId}`);
        }

        const offerRes = await client.query<{
          id: string;
          stock_quantity: number;
          price_minor: number;
          seller_id: string;
          product_id: string;
        }>(
          `SELECT id, stock_quantity, price_minor, seller_id, product_id
           FROM seller_offers
           WHERE id = $1
           FOR UPDATE;`,
          [item.offerId]
        );

        if (offerRes.rows.length === 0) {
          throw new Error(`Seller offer ${item.offerId} does not exist.`);
        }

        const offer = offerRes.rows[0]!;

        if (offer.stock_quantity < item.quantity) {
          throw new InsufficientStockError(item.offerId, item.quantity, offer.stock_quantity);
        }

        // 2. Decrement stock atomically
        await client.query(
          `UPDATE seller_offers
           SET stock_quantity = stock_quantity - $1,
               inventory_state = CASE WHEN (stock_quantity - $1) = 0 THEN 'out_of_stock' ELSE 'in_stock' END,
               updated_at = NOW()
           WHERE id = $2;`,
          [item.quantity, item.offerId]
        );

        const unitPriceMinor = offer.price_minor;
        const lineTotalMinor = unitPriceMinor * item.quantity;
        grandTotalMinor += lineTotalMinor;
        totalItemCount += item.quantity;

        const sellerId = offer.seller_id;
        const list = itemsBySeller.get(sellerId) || [];
        list.push({
          ...item,
          productId: offer.product_id,
          sellerId,
          unitPriceMinor,
          lineTotalMinor,
        });
        itemsBySeller.set(sellerId, list);
      }

      // 3. Create Root Multi-Vendor Order
      await client.query(
        `INSERT INTO orders (
           id, customer_id, currency, items_subtotal_minor, shipping_total_minor,
           tax_total_minor, grand_total_minor, item_count, status, shipping_address,
           payment_method, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, 0, 0, $5, $6, 'confirmed', $7, $8, NOW(), NOW());`,
        [
          orderId,
          input.customerId,
          orderCurrency,
          grandTotalMinor,
          grandTotalMinor,
          totalItemCount,
          JSON.stringify(input.shippingAddress),
          input.paymentMethod,
        ]
      );

      // 4. Create Seller Fulfillment Packages & Order Items
      const createdPackages: Array<{
        packageId: string;
        sellerId: string;
        packageNumber: string;
        subtotalMinor: number;
      }> = [];

      let packageIdx = 1;
      for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
        const packageId = `pkg-${crypto.randomUUID().slice(0, 12)}`;
        const packageNumber = `PKG-${orderId}-${String(packageIdx).padStart(2, '0')}`;
        const packageSubtotal = sellerItems.reduce((acc, curr) => acc + curr.lineTotalMinor, 0);

        await client.query(
          `INSERT INTO seller_packages (
             id, order_id, seller_id, package_number, status,
             subtotal_minor, shipping_minor, grand_total_minor, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, 'pending', $5, 0, $6, NOW(), NOW());`,
          [packageId, orderId, sellerId, packageNumber, packageSubtotal, packageSubtotal]
        );

        for (const item of sellerItems) {
          const itemId = `itm-${crypto.randomUUID().slice(0, 12)}`;
          await client.query(
            `INSERT INTO order_items (
               id, order_id, seller_id, product_id, sku, title,
               unit_price_minor, quantity, line_total_minor, currency, fulfillment_status, created_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW());`,
            [
              itemId,
              orderId,
              sellerId,
              item.productId,
              item.offerId,
              `Marketplace Item - ${item.productId}`,
              item.unitPriceMinor,
              item.quantity,
              item.lineTotalMinor,
              orderCurrency,
            ]
          );
        }

        createdPackages.push({
          packageId,
          sellerId,
          packageNumber,
          subtotalMinor: packageSubtotal,
        });
        packageIdx++;
      }

      // 5. Create Enterprise Security Audit Log
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
            currency: orderCurrency,
            packageCount: createdPackages.length,
            itemCount: totalItemCount,
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
        packageCount: createdPackages.length,
        itemCount: totalItemCount,
        grandTotalMinor,
        currency: orderCurrency,
        packages: createdPackages,
        createdAt: new Date(),
      };
    },
    { isolationLevel: 'READ COMMITTED' },
    targetPool
  );
}
