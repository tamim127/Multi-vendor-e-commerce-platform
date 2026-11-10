/**
 * ==============================================================================
 * CUSTOMER DOMAIN — AUTHENTICATION SCHEMAS & SECURITY TESTS
 * ==============================================================================
 */

import { describe, expect, it } from 'vitest';
import { LoginSchema, RegisterSchema, PasswordChangeSchema } from '@/domains/customer/schemas';
import { evaluatePasswordStrength } from '@/domains/customer/utils/auth-security';

describe('Customer Auth — Password Strength Evaluator', () => {
  it('identifies weak empty and short passwords', () => {
    const emptyResult = evaluatePasswordStrength('');
    expect(emptyResult.score).toBe(0);
    expect(emptyResult.hasMinLength).toBe(false);

    const shortResult = evaluatePasswordStrength('Ab1!');
    expect(shortResult.score).toBe(3);
    expect(shortResult.hasMinLength).toBe(false);
  });

  it('correctly scores complex passwords', () => {
    const result = evaluatePasswordStrength('Complex@Pass123');
    expect(result.score).toBe(4);
    expect(result.label).toBe('very_strong');
    expect(result.hasMinLength).toBe(true);
    expect(result.hasUppercase).toBe(true);
    expect(result.hasLowercase).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSpecial).toBe(true);
  });
});

describe('Customer Auth — LoginSchema', () => {
  it('accepts valid login credentials', () => {
    const valid = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'SecurePassword123!',
      rememberMe: true,
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid email formats', () => {
    const invalid = LoginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects empty password', () => {
    const invalid = LoginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(invalid.success).toBe(false);
  });
});

describe('Customer Auth — RegisterSchema', () => {
  it('accepts complete and valid registration data', () => {
    const valid = RegisterSchema.safeParse({
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      password: 'Secure@Password123',
      confirmPassword: 'Secure@Password123',
      acceptTerms: true,
    });
    expect(valid.success).toBe(true);
  });

  it('rejects when confirmPassword does not match password', () => {
    const invalid = RegisterSchema.safeParse({
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      password: 'Secure@Password123',
      confirmPassword: 'DifferentPassword123',
      acceptTerms: true,
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects when acceptTerms is false', () => {
    const invalid = RegisterSchema.safeParse({
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      password: 'Secure@Password123',
      confirmPassword: 'Secure@Password123',
      acceptTerms: false,
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects passwords failing complexity rules', () => {
    // Missing special character
    const invalidNoSpecial = RegisterSchema.safeParse({
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      password: 'SimplePassword123',
      confirmPassword: 'SimplePassword123',
      acceptTerms: true,
    });
    expect(invalidNoSpecial.success).toBe(false);

    // Missing uppercase
    const invalidNoUpper = RegisterSchema.safeParse({
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@example.com',
      password: 'simple@password123',
      confirmPassword: 'simple@password123',
      acceptTerms: true,
    });
    expect(invalidNoUpper.success).toBe(false);
  });
});

describe('Customer Auth — PasswordChangeSchema', () => {
  it('accepts valid password change matching confirmation', () => {
    const valid = PasswordChangeSchema.safeParse({
      currentPassword: 'OldPassword@123',
      newPassword: 'NewPassword@456',
      confirmNewPassword: 'NewPassword@456',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects when new passwords do not match', () => {
    const invalid = PasswordChangeSchema.safeParse({
      currentPassword: 'OldPassword@123',
      newPassword: 'NewPassword@456',
      confirmNewPassword: 'MismatchPassword@456',
    });
    expect(invalid.success).toBe(false);
  });
});
