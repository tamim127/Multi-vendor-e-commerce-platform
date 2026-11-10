/**
 * ==============================================================================
 * CUSTOMER DOMAIN — ADDRESS SCHEMAS TESTS
 * ==============================================================================
 */

import { describe, expect, it } from 'vitest';
import { AddressUpsertSchema, CustomerAddressSchema } from '@/domains/customer/schemas';

describe('Customer Address — AddressUpsertSchema', () => {
  it('validates a complete address correctly', () => {
    const valid = AddressUpsertSchema.safeParse({
      label: 'home',
      fullName: 'Sarah Jenkins',
      streetAddress: '742 Evergreen Terrace',
      streetAddress2: 'Apt 4B',
      city: 'Springfield',
      stateOrProvince: 'OR',
      postalCode: '97477',
      countryCode: 'US',
      phoneNumber: '+1 555-0199',
      isDefaultShipping: true,
      isDefaultBilling: false,
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid country code format', () => {
    const invalid = AddressUpsertSchema.safeParse({
      label: 'home',
      fullName: 'Sarah Jenkins',
      streetAddress: '742 Evergreen Terrace',
      city: 'Springfield',
      stateOrProvince: 'OR',
      postalCode: '97477',
      countryCode: 'USA', // Must be 2-letter ISO code
      phoneNumber: '+1 555-0199',
      isDefaultShipping: false,
      isDefaultBilling: false,
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects invalid address label', () => {
    const invalid = AddressUpsertSchema.safeParse({
      label: 'vacation-home', // Not in ['home', 'work', 'other']
      fullName: 'Sarah Jenkins',
      streetAddress: '742 Evergreen Terrace',
      city: 'Springfield',
      stateOrProvince: 'OR',
      postalCode: '97477',
      countryCode: 'US',
      phoneNumber: '+1 555-0199',
      isDefaultShipping: false,
      isDefaultBilling: false,
    });
    expect(invalid.success).toBe(false);
  });
});

describe('Customer Address — CustomerAddressSchema', () => {
  it('validates persistent address with timestamps and id', () => {
    const valid = CustomerAddressSchema.safeParse({
      id: 'addr-001',
      label: 'work',
      fullName: 'Sarah Jenkins',
      streetAddress: '100 Innovation Way',
      city: 'Seattle',
      stateOrProvince: 'WA',
      postalCode: '98101',
      countryCode: 'US',
      phoneNumber: '+1 555-0100',
      isDefaultShipping: false,
      isDefaultBilling: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects persistent address missing id or timestamps', () => {
    const invalid = CustomerAddressSchema.safeParse({
      label: 'work',
      fullName: 'Sarah Jenkins',
      streetAddress: '100 Innovation Way',
      city: 'Seattle',
      stateOrProvince: 'WA',
      postalCode: '98101',
      countryCode: 'US',
      phoneNumber: '+1 555-0100',
      isDefaultShipping: false,
      isDefaultBilling: true,
    });
    expect(invalid.success).toBe(false);
  });
});
