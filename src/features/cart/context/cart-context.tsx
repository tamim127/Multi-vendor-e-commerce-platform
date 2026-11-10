/**
 * ==============================================================================
 * SHOPPING CART FEATURE — REACT CONTEXT & STATE PROVIDER
 * ==============================================================================
 * Central reactive cart state with hydration-safe localStorage persistence,
 * multi-vendor grouping, and currency safety.
 */

'use client';

import * as React from 'react';
import type {
  AddToCartInput,
  Cart,
  CartItem,
  CartSellerGroup,
  CartStorageState,
} from '@/domains/cart/types/cart';
import type { CurrencyCode, Money } from '@/domains/catalog/types/pricing';
import {
  buildCartState,
  mergeOrAddItem,
  removeItemFromCart,
  updateItemQuantity,
} from '@/domains/cart/utils/calculations';
import { CartStorageStateSchema } from '@/domains/cart/schemas/cart.schema';

const CART_STORAGE_KEY = 'marketplace_cart_v1';
const CART_STORAGE_VERSION = 1;

export interface CartContextValue {
  cart: Cart;
  items: CartItem[];
  sellerGroups: CartSellerGroup[];
  itemCount: number;
  distinctItemCount: number;
  subtotal: Money;
  shippingTotal: Money;
  grandTotal: Money;
  currency: CurrencyCode;
  isHydrated: boolean;
  isDrawerOpen: boolean;
  currencyMismatchError: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (input: AddToCartInput) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  clearCart: () => void;
  clearCurrencyMismatch: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const EMPTY_INITIAL_ITEMS: CartItem[] = [];

export interface CartProviderProps {
  children: React.ReactNode;
  initialItems?: CartItem[];
  defaultCurrency?: CurrencyCode;
}

export function CartProvider({
  children,
  initialItems = EMPTY_INITIAL_ITEMS,
  defaultCurrency = 'USD',
}: CartProviderProps): React.JSX.Element {
  const [items, setItems] = React.useState<CartItem[]>(initialItems);
  const [currency, setCurrency] = React.useState<CurrencyCode>(defaultCurrency);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [currencyMismatchError, setCurrencyMismatchError] = React.useState<string | null>(null);

  // 1. Initial hydration read from localStorage (client only, once on mount)
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (
          raw &&
          raw.trim().startsWith('{') &&
          (!initialItems || initialItems.length === 0)
        ) {
          const parsed = JSON.parse(raw);
          const validation = CartStorageStateSchema.safeParse(parsed);
          if (validation.success && Array.isArray(validation.data.items)) {
            setItems(validation.data.items);
            setCurrency(validation.data.currency);
          }
        }
      }
    } catch {
      // Graceful fallback for private mode or corrupt storage: retain defaults
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Persist to localStorage whenever items or currency change (only after hydration)
  React.useEffect(() => {
    if (!isHydrated) return;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storagePayload: CartStorageState = {
          version: CART_STORAGE_VERSION,
          currency,
          items,
          updatedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storagePayload));
      }
    } catch {
      // Graceful fallback if localStorage writes fail
    }
  }, [items, currency, isHydrated]);

  // 3. Derived authoritative Cart projections
  const cart = React.useMemo(() => {
    return buildCartState(items, currency);
  }, [items, currency]);

  // Operations
  const openDrawer = React.useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = React.useCallback(() => setIsDrawerOpen((prev) => !prev), []);
  const clearCurrencyMismatch = React.useCallback(() => setCurrencyMismatchError(null), []);

  const addItem = React.useCallback(
    (input: AddToCartInput): boolean => {
      // If cart is empty, adopt the added item's currency
      const activeCurrency = items.length === 0 ? input.unitPrice.currency : currency;

      const result = mergeOrAddItem(items, input, activeCurrency);

      if (result.error) {
        setCurrencyMismatchError(result.error);
        return false;
      }

      setCurrencyMismatchError(null);
      if (items.length === 0) {
        setCurrency(input.unitPrice.currency);
      }
      setItems(result.items);
      setIsDrawerOpen(true);
      return true;
    },
    [items, currency]
  );

  const removeItem = React.useCallback((itemId: string) => {
    setItems((prev) => removeItemFromCart(prev, itemId));
  }, []);

  const updateQuantity = React.useCallback((itemId: string, quantity: number) => {
    setItems((prev) => updateItemQuantity(prev, itemId, quantity));
  }, []);

  const increaseQuantity = React.useCallback((itemId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      return updateItemQuantity(prev, itemId, item.quantity + 1);
    });
  }, []);

  const decreaseQuantity = React.useCallback((itemId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      return updateItemQuantity(prev, itemId, item.quantity - 1);
    });
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
    setCurrencyMismatchError(null);
  }, []);

  const contextValue: CartContextValue = React.useMemo(
    () => ({
      cart,
      items,
      sellerGroups: cart.sellerGroups,
      itemCount: cart.itemCount,
      distinctItemCount: cart.distinctItemCount,
      subtotal: cart.subtotal,
      shippingTotal: cart.shippingTotal,
      grandTotal: cart.grandTotal,
      currency: cart.currency,
      isHydrated,
      isDrawerOpen,
      currencyMismatchError,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      clearCurrencyMismatch,
    }),
    [
      cart,
      items,
      isHydrated,
      isDrawerOpen,
      currencyMismatchError,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      clearCurrencyMismatch,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

const defaultEmptyCart: Cart = buildCartState([], 'USD');

const defaultCartContextValue: CartContextValue = {
  cart: defaultEmptyCart,
  items: [],
  sellerGroups: [],
  itemCount: 0,
  distinctItemCount: 0,
  subtotal: defaultEmptyCart.subtotal,
  shippingTotal: defaultEmptyCart.shippingTotal,
  grandTotal: defaultEmptyCart.grandTotal,
  currency: 'USD',
  isHydrated: true,
  isDrawerOpen: false,
  currencyMismatchError: null,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  addItem: () => false,
  removeItem: () => {},
  updateQuantity: () => {},
  increaseQuantity: () => {},
  decreaseQuantity: () => {},
  clearCart: () => {},
  clearCurrencyMismatch: () => {},
};

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  return context ?? defaultCartContextValue;
}
