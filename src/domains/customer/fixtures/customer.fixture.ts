/**
 * ==============================================================================
 * CUSTOMER DOMAIN — DEMO CUSTOMER FIXTURES
 * ==============================================================================
 */

import type { Customer } from '../types/customer';
import type { CustomerAddress } from '../types/address';

export const DEMO_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr-primary-home',
    customerId: 'cust-demo-sarah',
    label: 'home',
    fullName: 'Sarah Jenkins',
    streetAddress: '742 Evergreen Terrace',
    streetAddress2: 'Apt 4B',
    city: 'Austin',
    stateOrProvince: 'TX',
    postalCode: '78701',
    countryCode: 'US',
    phoneNumber: '+1 512-555-0199',
    isDefaultShipping: true,
    isDefaultBilling: true,
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'addr-work-sf',
    customerId: 'cust-demo-sarah',
    label: 'work',
    fullName: 'Sarah Jenkins (Office)',
    streetAddress: '100 Enterprise Way',
    streetAddress2: 'Suite 400',
    city: 'San Francisco',
    stateOrProvince: 'CA',
    postalCode: '94107',
    countryCode: 'US',
    phoneNumber: '+1 415-555-0142',
    isDefaultShipping: false,
    isDefaultBilling: false,
    createdAt: '2026-02-01T14:20:00Z',
    updatedAt: '2026-02-01T14:20:00Z',
  },
];

export const DEMO_CUSTOMER: Customer = {
  id: 'cust-demo-sarah',
  email: 'sarah.jenkins@example.com',
  firstName: 'Sarah',
  lastName: 'Jenkins',
  phoneNumber: '+1 512-555-0199',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  status: 'active',
  emailVerified: true,
  preferences: {
    language: 'en',
    currency: 'USD',
    newsletterSubscribed: true,
    orderUpdatesEmail: true,
    orderUpdatesSms: false,
    twoFactorEnabled: false,
  },
  createdAt: '2025-11-20T10:00:00Z',
  updatedAt: '2026-02-15T11:00:00Z',
};

export const DEMO_PASSWORD = 'Demo@Password123';
