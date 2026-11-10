/**
 * ==============================================================================
 * CHECKOUT DOMAIN — ZOD SCHEMAS
 * ==============================================================================
 * Runtime validation for contact details, shipping addresses, and checkout submission.
 */

import { z } from 'zod';
import type {
  CheckoutContactInfo,
  CheckoutShippingAddress,
  DeliveryMethodType,
  CheckoutFormState,
} from '../types/checkout';

export const CheckoutContactInfoSchema: z.ZodType<CheckoutContactInfo> = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().min(6, 'Please enter a valid phone number'),
});

export const CheckoutShippingAddressSchema: z.ZodType<CheckoutShippingAddress> = z.object({
  address: z.string().trim().min(5, 'Street address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State / Province is required'),
  postalCode: z.string().trim().min(3, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
});

export const DeliveryMethodTypeSchema: z.ZodType<DeliveryMethodType> = z.enum([
  'standard',
  'express',
]);

export const CheckoutFormSchema: z.ZodType<CheckoutFormState> = z.object({
  contact: CheckoutContactInfoSchema,
  shipping: CheckoutShippingAddressSchema,
  deliveryMethod: DeliveryMethodTypeSchema,
});

