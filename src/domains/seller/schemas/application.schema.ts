/**
 * ==============================================================================
 * SELLER DOMAIN — APPLICATION & ONBOARDING SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { SellerApplicationInput } from '../types/application';
import type { SellerBusinessInfo } from '../types/seller';

export const BusinessInfoSchema: z.ZodType<SellerBusinessInfo> = z.object({
  legalBusinessName: z.string().trim().min(2, 'Legal business name is required').max(100),
  registrationNumber: z.string().trim().min(3, 'Registration number is required').max(50),
  taxIdentificationNumber: z.string().trim().min(3, 'Tax ID is required').max(50),
  businessType: z.enum(['corporation', 'llc', 'sole_proprietorship', 'partnership']),
  countryOfRegistration: z.string().trim().min(2).max(3),
  businessAddress: z.object({
    street: z.string().trim().min(5, 'Street address is required').max(150),
    street2: z.string().trim().max(100).optional(),
    city: z.string().trim().min(2, 'City is required').max(80),
    state: z.string().trim().min(2, 'State / Province is required').max(80),
    postalCode: z.string().trim().min(3, 'Postal code is required').max(20),
    country: z.string().trim().length(2, '2-letter country code required'),
  }),
  contactPerson: z.object({
    name: z.string().trim().min(2, 'Contact name is required').max(100),
    email: z.string().trim().email('Valid contact email is required'),
    phone: z.string().trim().min(7, 'Valid contact phone is required').max(25),
    role: z.string().trim().min(2, 'Contact role is required').max(50),
  }),
});

export const SellerApplicationSchema: z.ZodType<SellerApplicationInput> = z.object({
  storeName: z.string().trim().min(3, 'Store name must be at least 3 characters').max(60),
  storeSlug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Store slug can only contain lowercase letters, numbers, and hyphens'),
  storeDescription: z
    .string()
    .trim()
    .min(20, 'Please provide at least 20 characters describing your store')
    .max(1000),
  businessCategory: z.string().trim().min(2, 'Business category is required'),
  businessInfo: BusinessInfoSchema,
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Marketplace Merchant Terms',
  }),
  agreedToFeeStructure: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the platform fee structure',
  }),
});
