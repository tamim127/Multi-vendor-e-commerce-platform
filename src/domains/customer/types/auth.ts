/**
 * ==============================================================================
 * CUSTOMER DOMAIN — AUTHENTICATION TYPES
 * ==============================================================================
 */

import type { Customer } from './customer';

export interface AuthSession {
  sessionId: string;
  customer: Customer;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  acceptTerms: boolean;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: AuthSession | null;
}
