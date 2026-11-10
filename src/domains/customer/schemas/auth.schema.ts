/**
 * ==============================================================================
 * CUSTOMER DOMAIN — AUTHENTICATION & CREDENTIAL SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type { LoginCredentials, RegisterCredentials, PasswordChangeInput } from '../types/auth';

/**
 * Standard password security validation:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one numerical digit
 * - At least one special symbol
 */
export const passwordValidator: z.ZodType<string> = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const LoginSchema: z.ZodType<LoginCredentials> = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const RegisterSchema: z.ZodType<RegisterCredentials> = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: passwordValidator,
    confirmPassword: z.string().optional(),
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    phoneNumber: z.string().trim().max(25).optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const PasswordChangeSchema: z.ZodType<PasswordChangeInput> = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidator,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });
