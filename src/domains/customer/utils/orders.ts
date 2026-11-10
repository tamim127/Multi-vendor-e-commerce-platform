/**
 * ==============================================================================
 * CUSTOMER DOMAIN — ORDER MANAGEMENT UTILITIES
 * ==============================================================================
 */

import type { CustomerOrder } from '../types/order';
import { DEMO_ORDERS } from '../fixtures/orders.fixture';

export const PLACED_ORDERS_STORAGE_KEY = 'marketplace_placed_orders_v1';

export function getPlacedOrdersFromStorage(): CustomerOrder[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(PLACED_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as CustomerOrder[];
    }
  } catch {
    // Graceful fallback for corrupt local storage
  }
  return [];
}

export function savePlacedOrderToStorage(order: CustomerOrder): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const existing = getPlacedOrdersFromStorage();
    const updated = [order, ...existing.filter((o) => o.orderId !== order.orderId)];
    window.localStorage.setItem(PLACED_ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Graceful fallback
  }
}

export function getAllCustomerOrders(): CustomerOrder[] {
  const dynamicOrders = getPlacedOrdersFromStorage();
  const dynamicIds = new Set(dynamicOrders.map((o) => o.orderId));
  const filteredDemos = DEMO_ORDERS.filter((o) => !dynamicIds.has(o.orderId));
  return [...dynamicOrders, ...filteredDemos];
}

export function getCustomerOrderById(orderId: string): CustomerOrder | null {
  const all = getAllCustomerOrders();
  return all.find((o) => o.orderId === orderId) || null;
}
