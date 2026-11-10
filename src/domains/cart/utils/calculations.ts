/**
 * ==============================================================================
 * SHOPPING CART DOMAIN — CALCULATIONS & DOMAIN LOGIC
 * ==============================================================================
 * Centralized, currency-safe calculations and multi-vendor seller grouping.
 * Integer minor units strictly enforced with zero floating-point accumulation.
 */

import type { CurrencyCode } from '@/domains/catalog/types/pricing';
import { addMoney, createMoney, isValidMoney, multiplyMoney } from '@/domains/catalog/utils/money';
import type { AddToCartInput, Cart, CartItem, CartSellerGroup } from '../types/cart';

/**
 * Creates a unique deterministic composite ID for a cart item.
 * Preserves separate items when seller offers or variants differ.
 */
export function generateCartItemId(
  productId: string,
  variantId?: string,
  offerId?: string
): string {
  const v = variantId && variantId.trim().length > 0 ? variantId : 'default';
  const o = offerId && offerId.trim().length > 0 ? offerId : 'default';
  return `${productId}::${v}::${o}`;
}

/**
 * Converts AddToCartInput into a canonical CartItem.
 */
export function createCartItem(input: AddToCartInput): CartItem {
  if (!isValidMoney(input.unitPrice)) {
    throw new Error('Invalid unitPrice provided to createCartItem');
  }

  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
  const maxAvailableQuantity = Math.max(1, input.maxAvailableQuantity ?? 99);
  const effectiveQty = Math.min(quantity, maxAvailableQuantity);
  const now = new Date().toISOString();

  const id = generateCartItemId(input.productId, input.variantId, input.offerId);

  return {
    id,
    productId: input.productId,
    slug: input.slug,
    title: input.title,
    sku: input.sku,
    imageUrl: input.imageUrl,
    variantId: input.variantId,
    selectedOptions: input.selectedOptions,
    offerId: input.offerId,
    sellerId: input.sellerId,
    sellerName: input.sellerName,
    sellerSlug: input.sellerSlug,
    isSellerVerified: input.isSellerVerified,
    unitPrice: input.unitPrice,
    quantity: effectiveQty,
    lineTotal: multiplyMoney(input.unitPrice, effectiveQty),
    maxAvailableQuantity,
    shippingEstimate: input.shippingEstimate,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Adds an item to the cart or merges with existing item if product, variant,
 * and seller offer are identical. Preserves separate items when seller offers differ.
 */
export function mergeOrAddItem(
  existingItems: CartItem[],
  input: AddToCartInput,
  currentCartCurrency?: CurrencyCode
): { items: CartItem[]; addedItem: CartItem; error?: string } {
  // Enforce currency consistency across the cart
  if (
    currentCartCurrency &&
    existingItems.length > 0 &&
    input.unitPrice.currency !== currentCartCurrency
  ) {
    return {
      items: existingItems,
      addedItem: createCartItem(input),
      error: `Currency mismatch: Cart is in ${currentCartCurrency}, but item is in ${input.unitPrice.currency}`,
    };
  }

  const targetId = generateCartItemId(input.productId, input.variantId, input.offerId);
  const existingIndex = existingItems.findIndex((item) => item.id === targetId);

  if (existingIndex >= 0) {
    const existing = existingItems[existingIndex]!;
    const requestedQty = (input.quantity ?? 1) + existing.quantity;
    const maxQty = existing.maxAvailableQuantity || 99;
    const newQty = Math.min(requestedQty, maxQty);

    const updatedItem: CartItem = {
      ...existing,
      quantity: newQty,
      lineTotal: multiplyMoney(existing.unitPrice, newQty),
      updatedAt: new Date().toISOString(),
    };

    const nextItems = [...existingItems];
    nextItems[existingIndex] = updatedItem;

    return {
      items: nextItems,
      addedItem: updatedItem,
    };
  }

  const newItem = createCartItem(input);
  return {
    items: [...existingItems, newItem],
    addedItem: newItem,
  };
}

/**
 * Updates item quantity in cart. If quantity <= 0, removes the item.
 */
export function updateItemQuantity(
  items: CartItem[],
  itemId: string,
  newQuantity: number
): CartItem[] {
  if (newQuantity <= 0) {
    return removeItemFromCart(items, itemId);
  }

  return items.map((item) => {
    if (item.id !== itemId) return item;

    const boundedQty = Math.min(newQuantity, item.maxAvailableQuantity || 99);
    return {
      ...item,
      quantity: boundedQty,
      lineTotal: multiplyMoney(item.unitPrice, boundedQty),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Removes an item by its ID.
 */
export function removeItemFromCart(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((item) => item.id !== itemId);
}

/**
 * Groups cart items by merchant/seller for multi-vendor presentation and future order splitting.
 */
export function groupCartBySeller(items: CartItem[]): CartSellerGroup[] {
  if (items.length === 0) return [];

  const currency = items[0]!.unitPrice.currency;
  const groupsMap = new Map<string, CartItem[]>();

  for (const item of items) {
    const list = groupsMap.get(item.sellerId) || [];
    list.push(item);
    groupsMap.set(item.sellerId, list);
  }

  const groups: CartSellerGroup[] = [];

  for (const [sellerId, sellerItems] of groupsMap.entries()) {
    const first = sellerItems[0]!;
    let subtotal = createMoney(0, currency);
    let shippingCost = createMoney(0, currency);
    let totalUnits = 0;

    for (const item of sellerItems) {
      subtotal = addMoney(subtotal, item.lineTotal);
      totalUnits += item.quantity;

      // Seller shipping estimate calculation (if explicit non-free shipping is present)
      if (
        item.shippingEstimate &&
        !item.shippingEstimate.isFreeShipping &&
        item.shippingEstimate.shippingCost &&
        item.shippingEstimate.shippingCost.currency === currency
      ) {
        // Use highest shipping cost among items from the same seller for package delivery
        if (item.shippingEstimate.shippingCost.amountMinor > shippingCost.amountMinor) {
          shippingCost = item.shippingEstimate.shippingCost;
        }
      }
    }

    groups.push({
      sellerId,
      sellerName: first.sellerName,
      sellerSlug: first.sellerSlug,
      isVerified: first.isSellerVerified,
      items: sellerItems,
      subtotal,
      shippingCost,
      itemCount: totalUnits,
    });
  }

  return groups;
}

/**
 * Calculates complete Cart projections and totals safely.
 */
export function buildCartState(
  items: CartItem[],
  fallbackCurrency: CurrencyCode = 'USD',
  cartId = 'guest-cart'
): Cart {
  const currency: CurrencyCode = items.length > 0 ? items[0]!.unitPrice.currency : fallbackCurrency;
  const sellerGroups = groupCartBySeller(items);

  let subtotal = createMoney(0, currency);
  let shippingTotal = createMoney(0, currency);
  let itemCount = 0;

  for (const group of sellerGroups) {
    subtotal = addMoney(subtotal, group.subtotal);
    if (group.shippingCost) {
      shippingTotal = addMoney(shippingTotal, group.shippingCost);
    }
    itemCount += group.itemCount;
  }

  const grandTotal = addMoney(subtotal, shippingTotal);

  return {
    id: cartId,
    items,
    currency,
    itemCount,
    distinctItemCount: items.length,
    subtotal,
    shippingTotal,
    grandTotal,
    sellerGroups,
    createdAt: items[0]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
