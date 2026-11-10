/**
 * ==============================================================================
 * AUTHENTICATION FEATURE — LOGIN PAGE VIEW
 * ==============================================================================
 * Form interface for customer authentication with demo credentials auto-fill,
 * remember me option, client-side validation, and post-auth redirection.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { useI18n } from '@/lib/i18n';
import { LoginSchema } from '@/domains/customer/schemas';
import { DEMO_CUSTOMER, DEMO_PASSWORD } from '@/domains/customer/fixtures/customer.fixture';
import { Button } from '@/components/ui/button/button';
import { Lock, Mail, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginPageView(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { login, isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [rememberMe, setRememberMe] = React.useState<boolean>(true);
  const [errors, setErrors] = React.useState<Partial<Record<'email' | 'password', string>>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleFillDemo = (): void => {
    setEmail(DEMO_CUSTOMER.email);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = LoginSchema.safeParse({ email, password, rememberMe });
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
      const result = await login({ email, password, rememberMe });
      if (result.success) {
        router.push(redirectPath);
      } else {
        setServerError(result.error ?? 'Invalid email or password');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md py-8 px-4 sm:px-0 animate-in fade-in duration-200">
      <div className="rounded-2xl border border-border-default bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-fg-primary tracking-tight">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs text-fg-muted">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Demo Credentials Quick Action */}
        <div className="rounded-xl bg-surface-muted border border-border-subtle p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-fg-primary flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="size-3.5 text-primary" />
              <span>{t('auth.demoAccount')}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-2xs text-success font-semibold">
              <ShieldCheck className="size-3" />
              <span>Ready</span>
            </span>
          </div>
          <p className="text-2xs text-fg-muted">
            Instant evaluation login for QA testing and reviewers.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleFillDemo}
            className="w-full text-xs font-semibold cursor-pointer"
          >
            {t('auth.fillDemoCredentials')}
          </Button>
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

        {/* Login form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-xs font-bold text-fg-primary">
              {t('auth.email')}
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-9 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-2xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="text-xs font-bold text-fg-primary">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-default bg-surface pl-3 pr-9 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-fg-muted pointer-events-none" />
            </div>
            {errors.password && (
              <p className="text-2xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded-sm border-border-default text-primary focus:ring-primary"
              />
              <span className="text-fg-muted">{t('auth.rememberMe')}</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full font-bold cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing in...' : t('auth.signIn')}</span>
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        </form>

        {/* Footer switch */}
        <div className="text-center pt-2 border-t border-border-subtle">
          <p className="text-xs text-fg-muted">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              href={
                redirectPath !== '/account'
                  ? `/register?redirect=${encodeURIComponent(redirectPath)}`
                  : '/register'
              }
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
