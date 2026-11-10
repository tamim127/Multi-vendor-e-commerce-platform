/**
 * ==============================================================================
 * CUSTOMER DOMAIN — ADDRESS SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { AddressLabel, CustomerAddress, AddressUpsertInput } from '../types/address';

export const AddressLabelSchema: z.ZodType<AddressLabel> = z.enum(['home', 'work', 'other']);

const baseAddressObject = z.object({
  customerId: z.string().optional(),
  label: AddressLabelSchema,
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  streetAddress: z.string().trim().min(5, 'Street address is required').max(150),
  streetAddress2: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2, 'City is required').max(80),
  stateOrProvince: z.string().trim().min(2, 'State or province is required').max(80),
  postalCode: z.string().trim().min(3, 'Postal code is required').max(20),
  countryCode: z.string().trim().length(2, '2-letter country code required'),
  phoneNumber: z.string().trim().min(7, 'Valid phone number required').max(25),
  isDefaultShipping: z.boolean(),
  isDefaultBilling: z.boolean(),
});

export const AddressUpsertSchema: z.ZodType<AddressUpsertInput> = baseAddressObject;

export const CustomerAddressSchema: z.ZodType<CustomerAddress> = baseAddressObject.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
