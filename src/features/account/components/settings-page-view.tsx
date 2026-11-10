/**
 * ==============================================================================
 * ACCOUNT FEATURE — SETTINGS PAGE VIEW
 * ==============================================================================
 * Customer preferences: regional settings, notification toggles,
 * account security (password change with PasswordChangeSchema), and danger zone.
 */

'use client';

import * as React from 'react';
import { useAuth } from '@/features/auth';
import { useI18n } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/types';
import { Button } from '@/components/ui/button/button';
import { PasswordChangeSchema } from '@/domains/customer/schemas';
import { Bell, Globe, Lock, Shield, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export function SettingsPageView(): React.JSX.Element {
  const { customer, updatePreferences, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();

  // Notification states
  const [emailUpdates, setEmailUpdates] = React.useState<boolean>(
    customer?.preferences.orderUpdatesEmail ?? true
  );
  const [smsUpdates, setSmsUpdates] = React.useState<boolean>(
    customer?.preferences.orderUpdatesSms ?? false
  );
  const [newsletter, setNewsletter] = React.useState<boolean>(
    customer?.preferences.newsletterSubscribed ?? false
  );
  const [twoFactor, setTwoFactor] = React.useState<boolean>(
    customer?.preferences.twoFactorEnabled ?? false
  );

  const [prefSavedMessage, setPrefSavedMessage] = React.useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState<string>('');
  const [newPassword, setNewPassword] = React.useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState<string>('');
  const [pwdErrors, setPwdErrors] = React.useState<
    Partial<Record<'currentPassword' | 'newPassword' | 'confirmNewPassword', string>>
  >({});
  const [pwdSuccess, setPwdSuccess] = React.useState<boolean>(false);

  // Sync state if customer changes
  React.useEffect(() => {
    if (customer) {
      setEmailUpdates(customer.preferences.orderUpdatesEmail);
      setSmsUpdates(customer.preferences.orderUpdatesSms);
      setNewsletter(customer.preferences.newsletterSubscribed);
      setTwoFactor(customer.preferences.twoFactorEnabled);
    }
  }, [customer]);

  const handleSavePreferences = async (): Promise<void> => {
    await updatePreferences({
      orderUpdatesEmail: emailUpdates,
      orderUpdatesSms: smsUpdates,
      newsletterSubscribed: newsletter,
      twoFactorEnabled: twoFactor,
    });
    setPrefSavedMessage(t('settings.saved'));
    setTimeout(() => {
      setPrefSavedMessage(null);
    }, 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setPwdErrors({});
    setPwdSuccess(false);

    const validation = PasswordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (field && !fieldErrors[String(field)]) {
          fieldErrors[String(field)] = issue.message;
        }
      }
      setPwdErrors(fieldErrors);
      return;
    }

    // In demo environment, simulate successful update
    setPwdSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setPwdSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-fg-primary">{t('settings.title')}</h2>
      </div>

      {prefSavedMessage && (
        <div
          role="status"
          className="rounded-xl bg-success/10 border border-success/30 p-4 text-xs font-semibold text-success flex items-center gap-2"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{prefSavedMessage}</span>
        </div>
      )}

      {/* 1. Regional & Language Preferences */}
      <section className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-fg-primary border-b border-border-subtle pb-3">
          <Globe className="size-5 text-primary" />
          <h3 className="text-base font-bold">{t('settings.preferences')}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="settings-language" className="text-xs font-bold text-fg-primary">
              {t('settings.language')}
            </label>
            <select
              id="settings-language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full rounded-xl border border-border-default bg-surface px-3 py-2 text-xs font-medium text-fg-primary focus:border-primary focus:outline-hidden"
            >
              <option value="en">English (US)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ar">العربية (Arabic - RTL)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-currency" className="text-xs font-bold text-fg-primary">
              {t('settings.currency')}
            </label>
            <select
              id="settings-currency"
              disabled
              value={customer?.preferences.currency ?? 'USD'}
              className="w-full rounded-xl border border-border-default bg-surface-muted px-3 py-2 text-xs font-medium text-fg-muted cursor-not-allowed"
            >
              <option value="USD">USD ($) — Canonical Base</option>
            </select>
            <p className="text-2xs text-fg-muted">Currency is locked to canonical store base.</p>
          </div>
        </div>
      </section>

      {/* 2. Notification Preferences */}
      <section className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-fg-primary border-b border-border-subtle pb-3">
          <Bell className="size-5 text-primary" />
          <h3 className="text-base font-bold">{t('settings.notifications')}</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:bg-surface-muted transition-colors cursor-pointer">
            <div>
              <p className="text-xs font-bold text-fg-primary">{t('settings.emailUpdates')}</p>
              <p className="text-2xs text-fg-muted">
                Receive tracking updates and invoices via email
              </p>
            </div>
            <input
              type="checkbox"
              name="orderUpdatesEmail"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
              className="size-4 rounded-sm border-border-default text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:bg-surface-muted transition-colors cursor-pointer">
            <div>
              <p className="text-xs font-bold text-fg-primary">{t('settings.smsUpdates')}</p>
              <p className="text-2xs text-fg-muted">
                Receive instant courier delivery notifications
              </p>
            </div>
            <input
              type="checkbox"
              name="orderUpdatesSms"
              checked={smsUpdates}
              onChange={(e) => setSmsUpdates(e.target.checked)}
              className="size-4 rounded-sm border-border-default text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-border-subtle hover:bg-surface-muted transition-colors cursor-pointer">
            <div>
              <p className="text-xs font-bold text-fg-primary">{t('settings.newsletter')}</p>
              <p className="text-2xs text-fg-muted">
                Receive promotional discounts and product drops
              </p>
            </div>
            <input
              type="checkbox"
              name="newsletterSubscribed"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="size-4 rounded-sm border-border-default text-primary focus:ring-primary"
            />
          </label>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSavePreferences}
            className="font-semibold cursor-pointer"
          >
            {t('common.save')}
          </Button>
        </div>
      </section>

      {/* 3. Account Security & Password */}
      <section className="rounded-2xl border border-border-default bg-surface p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-fg-primary border-b border-border-subtle pb-3">
          <Shield className="size-5 text-primary" />
          <h3 className="text-base font-bold">{t('settings.security')}</h3>
        </div>

        {/* Two-Factor Auth Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-subtle">
          <div>
            <p className="text-xs font-bold text-fg-primary">{t('settings.twoFactor')}</p>
            <p className="text-2xs text-fg-muted">
              Enhance account safety with an extra auth challenge
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const nextVal = !twoFactor;
              setTwoFactor(nextVal);
              await updatePreferences({ twoFactorEnabled: nextVal });
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              twoFactor ? 'bg-primary' : 'bg-border-default'
            }`}
            role="switch"
            aria-checked={twoFactor}
          >
            <span
              className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                twoFactor ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Change Password Form */}
        <form noValidate onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-fg-primary flex items-center gap-1.5">
            <Lock className="size-3.5 text-fg-muted" />
            <span>{t('settings.changePassword')}</span>
          </h4>

          {pwdSuccess && (
            <div className="rounded-xl bg-success/10 border border-success/30 p-3 text-xs font-semibold text-success flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Password successfully changed.</span>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="currentPassword" className="text-2xs font-bold text-fg-muted">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-border-default bg-surface px-3 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
            />
            {pwdErrors.currentPassword && (
              <p className="text-2xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{pwdErrors.currentPassword}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="newPassword" className="text-2xs font-bold text-fg-muted">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-surface px-3 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
              />
              {pwdErrors.newPassword && (
                <p className="text-2xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{pwdErrors.newPassword}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmNewPassword" className="text-2xs font-bold text-fg-muted">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-surface px-3 py-2 text-xs text-fg-primary focus:border-primary focus:outline-hidden"
              />
              {pwdErrors.confirmNewPassword && (
                <p className="text-2xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{pwdErrors.confirmNewPassword}</span>
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="font-semibold cursor-pointer"
          >
            {t('settings.changePassword')}
          </Button>
        </form>
      </section>

      {/* 4. Danger Zone */}
      <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          <h3 className="text-base font-bold">{t('settings.dangerZone')}</h3>
        </div>
        <p className="text-xs text-fg-muted">
          Deactivating your account will permanently wipe your session and address book from this
          device.
        </p>
        <div className="pt-1">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => logout()}
            className="font-semibold cursor-pointer"
          >
            {t('settings.deactivateAccount')}
          </Button>
        </div>
      </section>
    </div>
  );
}
