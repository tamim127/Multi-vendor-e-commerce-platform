'use client';

/**
 * ==============================================================================
 * ADMIN PLATFORM SETTINGS VIEW
 * ==============================================================================
 * Marketplace-wide configuration: identity, commission take-rates, seller onboarding
 * compliance policies, return windows, feature flags, and demo environment reset.
 */

import React, { useState } from 'react';
import { useAdmin } from '../context/admin-context';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Settings, Percent, Store, Flag, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export function AdminSettingsView(): React.JSX.Element {
  const { settings, updateSettings, resetAllToDemo, hasPermission } = useAdmin();

  const [platformName, setPlatformName] = useState(settings.platformName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [defaultCommission, setDefaultCommission] = useState(
    settings.commission.defaultCommissionPercent
  );
  const [autoApproveDemo, setAutoApproveDemo] = useState(settings.onboarding.autoApproveDemo);
  const [returnDays, setReturnDays] = useState(settings.policies.standardReturnWindowDays);
  const [enableCoupons, setEnableCoupons] = useState(settings.featureFlags.enableCoupons);
  const [enableReviews, setEnableReviews] = useState(settings.featureFlags.enableReviewModeration);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canWrite = hasPermission('settings:write');

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!canWrite) return;

    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateSettings({
        platformName,
        supportEmail,
        commission: {
          ...settings.commission,
          defaultCommissionPercent: Number(defaultCommission),
        },
        onboarding: {
          ...settings.onboarding,
          autoApproveDemo,
        },
        policies: {
          ...settings.policies,
          standardReturnWindowDays: Number(returnDays),
        },
        featureFlags: {
          ...settings.featureFlags,
          enableCoupons,
          enableReviewModeration: enableReviews,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            Platform configuration updated successfully. All parameters recorded in audit trail.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Platform Identity */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#1E1E24] pb-3">
            <Settings className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Marketplace Identity</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="font-medium text-foreground">Platform Brand Name</label>
              <Input
                required
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                disabled={!canWrite}
                className="mt-1"
              />
            </div>

            <div>
              <label className="font-medium text-foreground">Support Helpdesk Email</label>
              <Input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                disabled={!canWrite}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Commission & Monetization */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#121215] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#1E1E24] pb-3">
            <Percent className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Financial & Take-Rate Policies</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="font-medium text-foreground">
                Default Marketplace Commission Take-Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="50"
                required
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(Number(e.target.value))}
                disabled={!canWrite}
                className="mt-1 font-mono"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Applied automatically across multi-vendor checkouts unless overridden by category.
              </span>
            </div>

            <div>
              <label className="font-medium text-foreground">
                Standard Customer Return Window (Days)
              </label>
              <Input
                type="number"
                min="1"
                max="90"
                required
                value={returnDays}
                onChange={(e) => setReturnDays(Number(e.target.value))}
                disabled={!canWrite}
                className="mt-1 font-mono"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Mandatory minimum return eligibility period for all merchants.
              </span>
            </div>
          </div>
        </div>

        {/* Merchant Onboarding Compliance */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Merchant Onboarding & Compliance
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproveDemo}
                onChange={(e) => setAutoApproveDemo(e.target.checked)}
                disabled={!canWrite}
                className="h-4 w-4 rounded border-border text-primary"
              />
              <div>
                <span className="font-semibold text-foreground">
                  Allow Instant Demo Auto-Approval
                </span>
                <p className="text-[11px] text-muted-foreground">
                  When enabled, merchant applicants can simulate immediate verification in
                  development.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Flag className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Platform Feature Flags</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableCoupons}
                onChange={(e) => setEnableCoupons(e.target.checked)}
                disabled={!canWrite}
                className="h-4 w-4 rounded border-border text-primary"
              />
              <div>
                <span className="font-semibold text-foreground">
                  Enable Promotional Voucher System
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Allows buyers to apply promotional discounts during checkout.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableReviews}
                onChange={(e) => setEnableReviews(e.target.checked)}
                disabled={!canWrite}
                className="h-4 w-4 rounded border-border text-primary"
              />
              <div>
                <span className="font-semibold text-foreground">
                  Enable Review Moderation Queue
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Automatically flags reviews with high report counts for compliance review.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        {canWrite && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onClick={resetAllToDemo}
              className="text-muted-foreground"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reset All Storage to Demo Defaults
            </Button>

            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
