/**
 * ==============================================================================
 * AUTHENTICATION FEATURE — REGISTRATION PAGE VIEW
 * ==============================================================================
 * Customer registration form with live password strength indicator,
 * Zod validation with RegisterSchema, terms of service agreement, and auto-login.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { useI18n } from '@/lib/i18n';
import { RegisterSchema } from '@/domains/customer/schemas';
import { evaluatePasswordStrength } from '@/domains/customer/utils/auth-security';
import { Button } from '@/components/ui/button/button';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export function RegisterPageView(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { register, isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [confirmPassword, setConfirmPassword] = React.useState<string>('');
  const [acceptTerms, setAcceptTerms] = React.useState<boolean>(false);

  const [errors, setErrors] = React.useState<
    Partial<
      Record<
        'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'acceptTerms',
        string
      >
    >
  >({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  // Live password strength calculation
  const strength = React.useMemo(() => evaluatePasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = RegisterSchema.safeParse({
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || undefined,
      password,
      confirmPassword,
      acceptTerms,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (field && !fieldErrors[String(field)]) {
          fieldErrors[String(field)] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || undefined,
        password,
        confirmPassword,
        acceptTerms,
      });

      if (result.success) {
        router.push(redirectPath);
      } else {
        setServerError(result.error ?? 'Registration could not be completed');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg py-8 px-4 sm:px-0 animate-in fade-in duration-200">
      <div className="rounded-2xl border border-border-default bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="size-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-fg-primary tracking-tight">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-xs text-fg-muted">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Server error alert */}
        {serverError && (
          <div
            role="alert"
            className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive flex items-center gap-2"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="reg-firstName" className="text-xs font-bold text-fg-primary">
                {t('auth.firstName')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-8 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
                />
                <User className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-fg-muted pointer-events-none" />
              </div>
              {errors.firstName && (
                <p className="text-2xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{errors.firstName}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-lastName" className="text-xs font-bold text-fg-primary">
                {t('auth.lastName')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-8 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
                />
                <User className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-fg-muted pointer-events-none" />
              </div>
              {errors.lastName && (
                <p className="text-2xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{errors.lastName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-email" className="text-xs font-bold text-fg-primary">
              {t('auth.email')} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-8 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
              />
              <Mail className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-fg-muted pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-2xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-phone" className="text-xs font-bold text-fg-primary">
              {t('auth.phone')}{' '}
              <span className="text-2xs font-normal text-fg-muted">(optional)</span>
            </label>
            <div className="relative">
              <input
                id="reg-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-8 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
              />
              <Phone className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-fg-muted pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="reg-password" className="text-xs font-bold text-fg-primary">
                {t('auth.password')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-8 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
                />
                <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-fg-muted pointer-events-none" />
              </div>
              {errors.password && (
                <p className="text-2xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-confirmPassword" className="text-xs font-bold text-fg-primary">
                {t('auth.confirmPassword')} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-8 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
                />
                <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-fg-muted pointer-events-none" />
              </div>
              {errors.confirmPassword && (
                <p className="text-2xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div className="space-y-1.5 rounded-xl border border-border-subtle bg-surface-muted p-2.5">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-medium text-fg-muted">Password Strength</span>
                <span
                  className={`font-bold capitalize ${
                    strength.score <= 1
                      ? 'text-destructive'
                      : strength.score === 2
                        ? 'text-warning'
                        : 'text-success'
                  }`}
                >
                  {strength.label.replace('_', ' ')}
                </span>
              </div>
              <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-colors ${
                      step <= strength.score
                        ? strength.score <= 1
                          ? 'bg-destructive'
                          : strength.score === 2
                            ? 'bg-warning'
                            : 'bg-success'
                        : 'bg-border-default'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 text-2xs text-fg-muted pt-1">
                <span
                  className={`flex items-center gap-1 ${strength.hasMinLength ? 'text-success' : ''}`}
                >
                  <CheckCircle2 className="size-2.5" /> 8+ Characters
                </span>
                <span
                  className={`flex items-center gap-1 ${strength.hasUppercase && strength.hasLowercase ? 'text-success' : ''}`}
                >
                  <CheckCircle2 className="size-2.5" /> Upper & Lowercase
                </span>
                <span
                  className={`flex items-center gap-1 ${strength.hasNumber ? 'text-success' : ''}`}
                >
                  <CheckCircle2 className="size-2.5" /> Number (0-9)
                </span>
                <span
                  className={`flex items-center gap-1 ${strength.hasSpecial ? 'text-success' : ''}`}
                >
                  <CheckCircle2 className="size-2.5" /> Special Symbol (!@#)
                </span>
              </div>
            </div>
          )}

          {/* Terms checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 size-4 rounded-sm border-border-default text-primary focus:ring-primary"
              />
              <span className="text-2xs text-fg-muted leading-tight">{t('auth.agreeTerms')}</span>
            </label>
            {errors.acceptTerms && (
              <p className="text-2xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{errors.acceptTerms}</span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full font-bold cursor-pointer"
          >
            <span>{isSubmitting ? 'Creating account...' : t('auth.signUp')}</span>
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        </form>

        {/* Footer switch */}
        <div className="text-center pt-2 border-t border-border-subtle">
          <p className="text-xs text-fg-muted">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href={
                redirectPath !== '/account'
                  ? `/login?redirect=${encodeURIComponent(redirectPath)}`
                  : '/login'
              }
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
