/**
 * ==============================================================================
 * ACCOUNT FEATURE — PROFILE PAGE VIEW
 * ==============================================================================
 * Customer profile management with real-time validation and verified status.
 */

'use client';

import * as React from 'react';
import { useAuth } from '@/features/auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import { ShieldCheck, User, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { CustomerProfileUpdateSchema } from '@/domains/customer/schemas';

export function ProfilePageView(): React.JSX.Element {
  const { customer, updateProfile } = useAuth();
  const { t } = useI18n();

  const [firstName, setFirstName] = React.useState(customer?.firstName ?? '');
  const [lastName, setLastName] = React.useState(customer?.lastName ?? '');
  const [phoneNumber, setPhoneNumber] = React.useState(customer?.phoneNumber ?? '');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName);
      setLastName(customer.lastName);
      setPhoneNumber(customer.phoneNumber ?? '');
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSuccessMessage(null);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
    };

    const validation = CustomerProfileUpdateSchema.safeParse(payload);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        errMap[issue.path[0] as string] = issue.message;
      }
      setFieldErrors(errMap);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    const res = await updateProfile(payload);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage(t('account.profileUpdated'));
    } else if (res.error) {
      setFieldErrors({ root: res.error });
    }
  };

  return (
    <div className="rounded-2xl border border-border-default bg-surface p-6 sm:p-8 shadow-xs max-w-2xl space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-fg-primary flex items-center gap-2">
          <User className="size-5 text-primary" />
          <span>{t('account.profile')}</span>
        </h2>
        <p className="text-xs text-fg-muted mt-1 leading-relaxed">
          Manage your personal details and contact preferences.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex items-center gap-3 text-xs text-success font-medium animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {fieldErrors['root'] && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-center gap-3 text-xs text-destructive font-medium animate-in fade-in">
          <AlertCircle className="size-4 shrink-0" />
          <span>{fieldErrors['root']}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="profile-firstName"
              className="block text-xs font-semibold text-fg-primary mb-1"
            >
              {t('auth.firstName')} *
            </label>
            <input
              id="profile-firstName"
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors['firstName']) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next['firstName'];
                    return next;
                  });
                }
              }}
              className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
            />
            {fieldErrors['firstName'] && (
              <p className="text-2xs text-destructive mt-1">{fieldErrors['firstName']}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="profile-lastName"
              className="block text-xs font-semibold text-fg-primary mb-1"
            >
              {t('auth.lastName')} *
            </label>
            <input
              id="profile-lastName"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors['lastName']) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next['lastName'];
                    return next;
                  });
                }
              }}
              className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
            />
            {fieldErrors['lastName'] && (
              <p className="text-2xs text-destructive mt-1">{fieldErrors['lastName']}</p>
            )}
          </div>
        </div>

        {/* Email Field (Protected) */}
        <div>
          <label
            htmlFor="profile-email"
            className="block text-xs font-semibold text-fg-primary mb-1"
          >
            {t('auth.email')}
          </label>
          <div className="relative">
            <input
              id="profile-email"
              type="email"
              disabled
              value={customer?.email ?? ''}
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-fg-muted cursor-not-allowed shadow-2xs pr-24"
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-1.5 text-2xs font-semibold text-success">
              <ShieldCheck className="size-3.5" />
              <span>{t('account.verified')}</span>
            </div>
          </div>
          <p className="text-2xs text-fg-subtle mt-1 flex items-center gap-1">
            <Mail className="size-3" />
            <span>Email is verified and locked to your primary login identity.</span>
          </p>
        </div>

        {/* Phone Field */}
        <div>
          <label
            htmlFor="profile-phone"
            className="block text-xs font-semibold text-fg-primary mb-1"
          >
            {t('auth.phone')}
          </label>
          <div className="relative">
            <input
              id="profile-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 555-0199"
              className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
            />
          </div>
          <p className="text-2xs text-fg-subtle mt-1 flex items-center gap-1">
            <Phone className="size-3" />
            <span>Used for SMS order notifications and delivery coordination.</span>
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSaving}
            className="font-bold cursor-pointer"
          >
            {isSaving ? t('account.saving') : t('account.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
