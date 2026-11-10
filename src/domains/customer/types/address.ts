/**
 * ==============================================================================
 * CUSTOMER DOMAIN — ADDRESS BOOK TYPES
 * ==============================================================================
 */

export type AddressLabel = 'home' | 'work' | 'other';

export interface CustomerAddress {
  id: string;
  customerId?: string;
  label: AddressLabel;
  fullName: string;
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AddressUpsertInput = Omit<CustomerAddress, 'id' | 'createdAt' | 'updatedAt'>;
