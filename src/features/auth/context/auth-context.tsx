'use client';

import * as React from 'react';
import type {
  Customer,
  CustomerProfileUpdateInput,
  CustomerPreferences,
} from '@/domains/customer/types/customer';
import type { CustomerAddress, AddressUpsertInput } from '@/domains/customer/types/address';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthSession,
} from '@/domains/customer/types/auth';
import { DEMO_ADDRESSES } from '@/domains/customer/fixtures/customer.fixture';
import {
  LoginSchema,
  RegisterSchema,
  CustomerProfileUpdateSchema,
  AddressUpsertSchema,
} from '@/domains/customer/schemas';
import { buildApiHeaders } from '@/lib/http/csrf';

export interface AuthContextValue {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  addresses: CustomerAddress[];
  session: AuthSession | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (
    input: CustomerProfileUpdateInput
  ) => Promise<{ success: boolean; error?: string }>;
  addAddress: (input: AddressUpsertInput) => Promise<CustomerAddress>;
  updateAddress: (addressId: string, input: AddressUpsertInput) => Promise<CustomerAddress>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultShippingAddress: (addressId: string) => Promise<void>;
  setDefaultBillingAddress: (addressId: string) => Promise<void>;
  updatePreferences: (preferences: Partial<CustomerPreferences>) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  initialCustomer?: Customer | null;
}

export function AuthProvider({
  children,
  initialCustomer = null,
}: AuthProviderProps): React.JSX.Element {
  const [customer, setCustomer] = React.useState<Customer | null>(initialCustomer);
  const [addresses, setAddresses] = React.useState<CustomerAddress[]>(
    initialCustomer ? DEMO_ADDRESSES : []
  );
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(!initialCustomer);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const fetchAddresses = React.useCallback(async () => {
    try {
      const res = await fetch('/api/customer/addresses', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAddresses(json.data);
        }
      }
    } catch {
      // Leave current list
    }
  }, []);

  const refreshSession = React.useCallback(async () => {
    try {
      setAuthError(null);
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 503) {
          setAuthError('Authentication database is temporarily unavailable.');
        }
        setCustomer(null);
        setSession(null);
        setAddresses([]);
        return;
      }

      if (json?.data?.isAuthenticated && json.data.customer) {
        setCustomer(json.data.customer);
        setSession({
          sessionId: 'active-db-session',
          customer: json.data.customer,
          expiresAt: json.data.expiresAt || new Date(Date.now() + 86400000).toISOString(),
        });
        await fetchAddresses();
      } else {
        setCustomer(null);
        setSession(null);
        setAddresses([]);
      }
    } catch {
      // Graceful offline/test check
    } finally {
      setIsLoading(false);
    }
  }, [fetchAddresses]);

  React.useEffect(() => {
    if (initialCustomer) {
      setIsLoading(false);
      return;
    }
    void refreshSession();
  }, [initialCustomer, refreshSession]);

  const login = React.useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      const validation = LoginSchema.safeParse(credentials);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0]?.message ?? 'Invalid credentials format',
        };
      }

      setIsLoading(true);
      setAuthError(null);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: buildApiHeaders(),
          body: JSON.stringify(credentials),
        });
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success) {
          const msg = json?.error || `Authentication failed (HTTP ${res.status})`;
          setAuthError(msg);
          return { success: false, error: msg };
        }

        const loggedCustomer = json.data.customer as Customer;
        setCustomer(loggedCustomer);
        setSession({
          sessionId: 'active-db-session',
          customer: loggedCustomer,
          expiresAt: json.data.expiresAt,
        });
        await fetchAddresses();
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to reach authentication server.';
        setAuthError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAddresses]
  );

  const register = React.useCallback(
    async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
      const validation = RegisterSchema.safeParse(credentials);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0]?.message ?? 'Invalid registration data',
        };
      }

      setIsLoading(true);
      setAuthError(null);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: buildApiHeaders(),
          body: JSON.stringify(credentials),
        });
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success) {
          const msg = json?.error || `Registration failed (HTTP ${res.status})`;
          setAuthError(msg);
          return { success: false, error: msg };
        }

        const newCustomer = json.data.customer as Customer;
        setCustomer(newCustomer);
        setAddresses([]);
        setSession({
          sessionId: 'active-db-session',
          customer: newCustomer,
          expiresAt: json.data.expiresAt,
        });
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to reach registration server.';
        setAuthError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: buildApiHeaders(),
      });
    } catch {
      // Clear local state regardless
    } finally {
      setCustomer(null);
      setAddresses([]);
      setSession(null);
      setIsLoading(false);
    }
  }, []);

  const logoutAllDevices = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout-all', {
        method: 'POST',
        credentials: 'include',
        headers: buildApiHeaders(),
      });
    } finally {
      setCustomer(null);
      setAddresses([]);
      setSession(null);
      setIsLoading(false);
    }
  }, []);

  const updateProfile = React.useCallback(
    async (input: CustomerProfileUpdateInput): Promise<{ success: boolean; error?: string }> => {
      const validation = CustomerProfileUpdateSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0]?.message ?? 'Invalid profile data',
        };
      }

      try {
        const res = await fetch('/api/customer/profile', {
          method: 'PATCH',
          credentials: 'include',
          headers: buildApiHeaders(),
          body: JSON.stringify(input),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          return { success: false, error: json?.error || 'Failed to update profile' };
        }

        setCustomer((prev) => (prev ? { ...prev, ...json.data } : json.data));
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Network error' };
      }
    },
    []
  );

  const addAddress = React.useCallback(async (input: AddressUpsertInput): Promise<CustomerAddress> => {
    const validation = AddressUpsertSchema.safeParse(input);
    if (!validation.success) {
      throw new Error(validation.error.issues[0]?.message ?? 'Invalid address');
    }

    const res = await fetch('/api/customer/addresses', {
      method: 'POST',
      credentials: 'include',
      headers: buildApiHeaders(),
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error || 'Failed to save address');
    }
    const created = json.data as CustomerAddress;
    await fetchAddresses();
    return created;
  }, [fetchAddresses]);

  const updateAddress = React.useCallback(
    async (addressId: string, input: AddressUpsertInput): Promise<CustomerAddress> => {
      const validation = AddressUpsertSchema.safeParse(input);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message ?? 'Invalid address');
      }

      const res = await fetch(`/api/customer/addresses/${encodeURIComponent(addressId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify(input),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to update address');
      }
      await fetchAddresses();
      return json.data as CustomerAddress;
    },
    [fetchAddresses]
  );

  const deleteAddress = React.useCallback(
    async (addressId: string): Promise<void> => {
      const res = await fetch(`/api/customer/addresses/${encodeURIComponent(addressId)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildApiHeaders(),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to delete address');
      }
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const setDefaultShippingAddress = React.useCallback(
    async (addressId: string): Promise<void> => {
      const res = await fetch(`/api/customer/addresses/${encodeURIComponent(addressId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify({ isDefaultShipping: true }),
      });
      if (!res.ok) throw new Error('Failed to update default shipping address');
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const setDefaultBillingAddress = React.useCallback(
    async (addressId: string): Promise<void> => {
      const res = await fetch(`/api/customer/addresses/${encodeURIComponent(addressId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify({ isDefaultBilling: true }),
      });
      if (!res.ok) throw new Error('Failed to update default billing address');
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const updatePreferences = React.useCallback(
    async (prefs: Partial<CustomerPreferences>): Promise<void> => {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: buildApiHeaders(),
        body: JSON.stringify({ preferences: prefs }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setCustomer((prev) =>
          prev ? { ...prev, preferences: json.data.preferences || { ...prev.preferences, ...prefs } } : null
        );
      }
    },
    []
  );

  const value = React.useMemo<AuthContextValue>(() => {
    return {
      customer,
      isAuthenticated: Boolean(customer),
      isLoading,
      authError,
      addresses,
      session,
      login,
      register,
      logout,
      logoutAllDevices,
      refreshSession,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultShippingAddress,
      setDefaultBillingAddress,
      updatePreferences,
    };
  }, [
    customer,
    isLoading,
    authError,
    addresses,
    session,
    login,
    register,
    logout,
    logoutAllDevices,
    refreshSession,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultShippingAddress,
    setDefaultBillingAddress,
    updatePreferences,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    return {
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
      addresses: [],
      session: null,
      login: async () => ({ success: false, error: 'Auth context not mounted' }),
      register: async () => ({ success: false, error: 'Auth context not mounted' }),
      logout: async () => {},
      logoutAllDevices: async () => {},
      refreshSession: async () => {},
      updateProfile: async () => ({ success: false, error: 'Auth context not mounted' }),
      addAddress: async () => {
        throw new Error('Auth context not mounted');
      },
      updateAddress: async () => {
        throw new Error('Auth context not mounted');
      },
      deleteAddress: async () => {},
      setDefaultShippingAddress: async () => {},
      setDefaultBillingAddress: async () => {},
      updatePreferences: async () => {},
    };
  }
  return context;
}
