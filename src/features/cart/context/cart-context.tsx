'use client';

import * as React from 'react';
import type {
  AddToCartInput,
  Cart,
  CartItem,
  CartSellerGroup,
} from '@/domains/cart/types/cart';
import type { CurrencyCode, Money } from '@/domains/catalog/types/pricing';
import {
  buildCartState,
  mergeOrAddItem,
  removeItemFromCart,
  updateItemQuantity,
} from '@/domains/cart/utils/calculations';
import { buildApiHeaders } from '@/lib/http/csrf';
import { useAuth } from '@/features/auth/context/auth-context';

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
  cartError: string | null;
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
  refreshCart: () => Promise<void>;
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
  const hasInjectedItems = initialItems.length > 0;
  const { customer, isLoading: authLoading } = useAuth();
  const [items, setItems] = React.useState<CartItem[]>(initialItems);
  const [currency, setCurrency] = React.useState<CurrencyCode>(defaultCurrency);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(hasInjectedItems);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [currencyMismatchError, setCurrencyMismatchError] = React.useState<string | null>(null);
  const [cartError, setCartError] = React.useState<string | null>(null);

  const refreshCart = React.useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json.data) {
        setItems(json.data.items || []);
        setCurrency((json.data.currency || 'USD') as CurrencyCode);
        setCartError(null);
      } else if (!res.ok && json?.error) {
        setCartError(json.error);
      }
    } catch {
      // Offline / isolated test render
    } finally {
      setIsHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (hasInjectedItems) {
      setIsHydrated(true);
      return;
    }
    if (authLoading) return;
    void refreshCart();
  }, [hasInjectedItems, authLoading, customer?.id, refreshCart]);

  const cart = React.useMemo(() => buildCartState(items, currency), [items, currency]);

  const openDrawer = React.useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = React.useCallback(() => setIsDrawerOpen((prev) => !prev), []);
  const clearCurrencyMismatch = React.useCallback(() => setCurrencyMismatchError(null), []);

  const syncCartMutation = React.useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
        headers: buildApiHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json.data) {
        setItems(json.data.items || []);
        setCurrency((json.data.currency || 'USD') as CurrencyCode);
        setCartError(null);
      } else if (json?.error) {
        setCartError(json.error);
        setCurrencyMismatchError(json.error);
      }
    } catch (err) {
      setCartError(err instanceof Error ? err.message : 'Cart synchronization failed');
    }
  }, []);

  const addItem = React.useCallback(
    (input: AddToCartInput): boolean => {
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

      if (!hasInjectedItems) {
        void syncCartMutation({
          action: 'add',
          productId: input.productId,
          offerId: input.offerId,
          variantId: input.variantId,
          variantLabel: input.selectedOptions
            ? Object.entries(input.selectedOptions)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' / ')
            : undefined,
          quantity: input.quantity,
        });
      }
      return true;
    },
    [items, currency, hasInjectedItems, syncCartMutation]
  );

  const removeItem = React.useCallback(
    (itemId: string) => {
      setItems((prev) => removeItemFromCart(prev, itemId));
      if (!hasInjectedItems) {
        void syncCartMutation({ action: 'remove', itemId });
      }
    },
    [hasInjectedItems, syncCartMutation]
  );

  const updateQuantity = React.useCallback(
    (itemId: string, quantity: number) => {
      setItems((prev) => updateItemQuantity(prev, itemId, quantity));
      if (!hasInjectedItems) {
        void syncCartMutation({ action: 'update', itemId, quantity });
      }
    },
    [hasInjectedItems, syncCartMutation]
  );

  const increaseQuantity = React.useCallback(
    (itemId: string) => {
      const found = items.find((i) => i.id === itemId);
      if (!found) return;
      updateQuantity(itemId, found.quantity + 1);
    },
    [items, updateQuantity]
  );

  const decreaseQuantity = React.useCallback(
    (itemId: string) => {
      const found = items.find((i) => i.id === itemId);
      if (!found) return;
      updateQuantity(itemId, found.quantity - 1);
    },
    [items, updateQuantity]
  );

  const clearCart = React.useCallback(() => {
    setItems([]);
    setCurrencyMismatchError(null);
    if (!hasInjectedItems) {
      void syncCartMutation({ action: 'clear' });
    }
  }, [hasInjectedItems, syncCartMutation]);

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
      cartError,
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
      refreshCart,
    }),
    [
      cart,
      items,
      isHydrated,
      isDrawerOpen,
      currencyMismatchError,
      cartError,
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
      refreshCart,
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
  cartError: null,
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
  refreshCart: async () => {},
};

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  return context ?? defaultCartContextValue;
}
