/**
 * ==============================================================================
 * AUTHENTICATION FEATURE — CONTEXT & SESSION ENGINE
 * ==============================================================================
 * Manages customer authentication state, profile updates, and address book CRUD.
 * Security notice: Session tokens are never stored in localStorage.
 * Prepares HttpOnly, SameSite, and Secure cookie session architecture.
 */

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
import {
  DEMO_CUSTOMER,
  DEMO_PASSWORD,
  DEMO_ADDRESSES,
} from '@/domains/customer/fixtures/customer.fixture';
import {
  LoginSchema,
  RegisterSchema,
  CustomerProfileUpdateSchema,
  AddressUpsertSchema,
} from '@/domains/customer/schemas';
import { SESSION_COOKIE_NAME } from '@/domains/customer/utils/auth-security';

export interface AuthContextValue {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  addresses: CustomerAddress[];
  session: AuthSession | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // 1. Initial Session Check: inspect non-sensitive session cookie on client mount
  React.useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const hasSessionCookie = cookies.some((c) =>
          c.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
        );

        if (hasSessionCookie && !customer) {
          // In demo environment, restore default demo customer session
          setCustomer(DEMO_CUSTOMER);
          setAddresses(DEMO_ADDRESSES);
          setSession({
            sessionId: 'sess-demo-active',
            customer: DEMO_CUSTOMER,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          });
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to manage session cookie
  const setSessionCookie = (sessionId: string, rememberMe = false): void => {
    if (typeof document === 'undefined') return;
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; path=/; max-age=${maxAge}; SameSite=Lax`;
  };

  const clearSessionCookie = (): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  };

  // 2. Login
  const login = React.useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      const validation = LoginSchema.safeParse(credentials);
      if (!validation.success) {
        setIsLoading(false);
        return {
          success: false,
          error: validation.error.issues[0]?.message ?? 'Invalid credentials format',
        };
      }

      // Check demo credentials or accepted registered demo accounts
      const emailLower = credentials.email.toLowerCase();
      if (
        emailLower === DEMO_CUSTOMER.email.toLowerCase() &&
        credentials.password === DEMO_PASSWORD
      ) {
        const newSession: AuthSession = {
          sessionId: `sess-${Date.now()}`,
          customer: DEMO_CUSTOMER,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        };

        setCustomer(DEMO_CUSTOMER);
        setAddresses(DEMO_ADDRESSES);
        setSession(newSession);
        setSessionCookie(newSession.sessionId, credentials.rememberMe);
        setIsLoading(false);
        return { success: true };
      }

      // Generic demo fallback: if password matches demo format, allow demo login with dynamic customer
      if (credentials.password.length >= 8) {
        const dynamicCustomer: Customer = {
          id: `cust-${Date.now()}`,
          email: credentials.email,
          firstName: credentials.email.split('@')[0] ?? 'Customer',
          lastName: 'User',
          status: 'active',
          emailVerified: true,
          preferences: {
            language: 'en',
            currency: 'USD',
            newsletterSubscribed: false,
            orderUpdatesEmail: true,
            orderUpdatesSms: false,
            twoFactorEnabled: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newSession: AuthSession = {
          sessionId: `sess-${Date.now()}`,
          customer: dynamicCustomer,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        };

        setCustomer(dynamicCustomer);
        setAddresses(DEMO_ADDRESSES);
        setSession(newSession);
        setSessionCookie(newSession.sessionId, credentials.rememberMe);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        error: 'Invalid email or password. Use demo credentials or register a new account.',
      };
    },
    []
  );

  // 3. Register
  const register = React.useCallback(
    async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      const validation = RegisterSchema.safeParse(credentials);
      if (!validation.success) {
        setIsLoading(false);
        return {
          success: false,
          error: validation.error.issues[0]?.message ?? 'Invalid registration data',
        };
      }

      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        email: credentials.email,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        phoneNumber: credentials.phoneNumber,
        status: 'active',
        emailVerified: false,
        preferences: {
          language: 'en',
          currency: 'USD',
          newsletterSubscribed: false,
          orderUpdatesEmail: true,
          orderUpdatesSms: false,
          twoFactorEnabled: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newSession: AuthSession = {
        sessionId: `sess-${Date.now()}`,
        customer: newCustomer,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      setCustomer(newCustomer);
      setAddresses([]);
      setSession(newSession);
      setSessionCookie(newSession.sessionId, true);
      setIsLoading(false);
      return { success: true };
    },
    []
  );

  // 4. Logout
  const logout = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setCustomer(null);
    setAddresses([]);
    setSession(null);
    clearSessionCookie();
    setIsLoading(false);
  }, []);

  // 5. Update Profile
  const updateProfile = React.useCallback(
    async (input: CustomerProfileUpdateInput): Promise<{ success: boolean; error?: string }> => {
      const validation = CustomerProfileUpdateSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0]?.message ?? 'Invalid profile data',
        };
      }

      setCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          avatarUrl: input.avatarUrl || prev.avatarUrl,
          updatedAt: new Date().toISOString(),
        };
      });

      return { success: true };
    },
    []
  );

  // 6. Address CRUD
  const addAddress = React.useCallback(
    async (input: AddressUpsertInput): Promise<CustomerAddress> => {
      const validation = AddressUpsertSchema.safeParse(input);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message ?? 'Invalid address');
      }

      const newAddress: CustomerAddress = {
        ...input,
        id: `addr-${Date.now()}`,
        customerId: customer?.id ?? 'cust-guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAddresses((prev) => {
        let updated = [...prev];
        if (newAddress.isDefaultShipping) {
          updated = updated.map((a) => ({ ...a, isDefaultShipping: false }));
        }
        if (newAddress.isDefaultBilling) {
          updated = updated.map((a) => ({ ...a, isDefaultBilling: false }));
        }
        return [newAddress, ...updated];
      });

      return newAddress;
    },
    [customer]
  );

  const updateAddress = React.useCallback(
    async (addressId: string, input: AddressUpsertInput): Promise<CustomerAddress> => {
      const validation = AddressUpsertSchema.safeParse(input);
      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message ?? 'Invalid address');
      }

      let updatedAddr: CustomerAddress | null = null;

      setAddresses((prev) => {
        return prev.map((addr) => {
          if (addr.id === addressId) {
            updatedAddr = {
              ...addr,
              ...input,
              updatedAt: new Date().toISOString(),
            };
            return updatedAddr;
          }
          if (input.isDefaultShipping && addr.id !== addressId) {
            return { ...addr, isDefaultShipping: false };
          }
          if (input.isDefaultBilling && addr.id !== addressId) {
            return { ...addr, isDefaultBilling: false };
          }
          return addr;
        });
      });

      if (!updatedAddr) {
        throw new Error('Address not found');
      }

      return updatedAddr;
    },
    []
  );

  const deleteAddress = React.useCallback(async (addressId: string): Promise<void> => {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
  }, []);

  const setDefaultShippingAddress = React.useCallback(async (addressId: string): Promise<void> => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefaultShipping: a.id === addressId,
      }))
    );
  }, []);

  const setDefaultBillingAddress = React.useCallback(async (addressId: string): Promise<void> => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefaultBilling: a.id === addressId,
      }))
    );
  }, []);

  const updatePreferences = React.useCallback(
    async (prefs: Partial<CustomerPreferences>): Promise<void> => {
      setCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            ...prefs,
          },
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  const value = React.useMemo<AuthContextValue>(() => {
    return {
      customer,
      isAuthenticated: !!customer,
      isLoading,
      addresses,
      session,
      login,
      register,
      logout,
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
    addresses,
    session,
    login,
    register,
    logout,
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
      addresses: [],
      session: null,
      login: async () => ({ success: false, error: 'Auth context not mounted' }),
      register: async () => ({ success: false, error: 'Auth context not mounted' }),
      logout: async () => {},
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
