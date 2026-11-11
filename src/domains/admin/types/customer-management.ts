/**
 * ==============================================================================
 * ADMIN DOMAIN — CUSTOMER MANAGEMENT TYPES
 * ==============================================================================
 */

export type CustomerAccountStatus = 'active' | 'suspended';

export type CustomerModerationAction = 'suspend' | 'reactivate' | 'add_note';

export interface CustomerAdminSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  status: CustomerAccountStatus;
  totalOrders: number;
  totalSpentMinor: number;
  joinedAt: string;
  lastLoginAt?: string;
  notes?: string[];
  isDemo?: boolean;
}
