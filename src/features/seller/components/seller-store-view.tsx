'use client';

/**
 * ==============================================================================
 * SELLER STORE MANAGEMENT VIEW
 * ==============================================================================
 * Configuration interface for merchant storefront branding, contact channels,
 * legal policies, and fulfillment logistics settings.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useSeller } from '../context/seller-context';
import { StoreProfileUpdateSchema } from '@/domains/seller/schemas/store.schema';
import type { StoreProfileUpdateInput } from '@/domains/seller/types/store';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import { Spinner } from '@/components/ui/spinner/spinner';
import { Store, ExternalLink, Save, CheckCircle2, Shield, Truck, RotateCcw } from 'lucide-react';

export function SellerStoreView(): React.JSX.Element {
  const { sellerProfile, updateStoreProfile } = useSeller();
  const { t } = useI18n();

  const [formData, setFormData] = useState<StoreProfileUpdateInput>({
    name: sellerProfile.name,
    tagline: sellerProfile.tagline || 'Direct from Certified Manufacturers',
    description:
      sellerProfile.description ||
      'Authorized premier distributor of high-performance electronics, professional computing workstations, and mobile devices.',
    logoUrl:
      sellerProfile.logoUrl ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop',
    bannerUrl:
      sellerProfile.bannerUrl ||
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=300&fit=crop',
    supportEmail: sellerProfile.businessInfo.contactPerson.email || 'support@techdirect.com',
    supportPhone: sellerProfile.businessInfo.contactPerson.phone || '+1 (800) 555-0199',
    shippingPolicy:
      'All orders are processed and dispatched within 1-2 business days with full transit insurance. Express carrier options available at checkout.',
    returnPolicy:
      'Hassle-free 30-day return policy for unopened items in original packaging. Merchant provides prepaid return label for verified hardware defects.',
    warrantyPolicy:
      'Comprehensive 1-year authorized manufacturer warranty coverage included with all hardware purchases.',
    fulfillmentSettings: sellerProfile.fulfillmentSettings,
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(false);

    const result = StoreProfileUpdateSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join('.')] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await updateStoreProfile(result.data);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const storeSlug = sellerProfile.slug;

  return (
    <div className="space-y-6">
      {/* Header with Storefront Preview Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('seller.storeSettings')}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your public storefront branding, customer support contact info, and policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="tertiary" size="sm" className="text-xs">
            <Link href={`/store/${storeSlug}`} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              {t('seller.storefrontPreview')}
            </Link>
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Store settings have been updated and synchronized with your public storefront.
          </span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1: Storefront Branding */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Store className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Storefront Branding & Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Public Store Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors['name'] && <p className="mt-1 text-xs text-destructive">{errors['name']}</p>}
            </div>

            <div>
              <label
                htmlFor="tagline"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Storefront Tagline
              </label>
              <input
                id="tagline"
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="e.g. Authorized Premier Distributor"
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                About the Store / Bio
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="logoUrl"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Store Logo URL
              </label>
              <input
                id="logoUrl"
                type="text"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="bannerUrl"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Storefront Header Banner URL
              </label>
              <input
                id="bannerUrl"
                type="text"
                value={formData.bannerUrl || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, bannerUrl: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Customer Support Channels */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Customer Support Contacts</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="supportEmail"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Customer Support Email *
              </label>
              <input
                id="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, supportEmail: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors['supportEmail'] && (
                <p className="mt-1 text-xs text-destructive">{errors['supportEmail']}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="supportPhone"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Support Telephone Number
              </label>
              <input
                id="supportPhone"
                type="tel"
                value={formData.supportPhone || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, supportPhone: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Commercial Policies */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Truck className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Shipping & Return Policies</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="shippingPolicy"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Shipping Policy
              </label>
              <textarea
                id="shippingPolicy"
                rows={3}
                value={formData.shippingPolicy || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, shippingPolicy: e.target.value }))
                }
                className="mt-1.5 block w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="returnPolicy"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Return & Refund Policy
              </label>
              <textarea
                id="returnPolicy"
                rows={3}
                value={formData.returnPolicy || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, returnPolicy: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="warrantyPolicy"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Warranty & Authenticity Guarantee
              </label>
              <textarea
                id="warrantyPolicy"
                rows={3}
                value={formData.warrantyPolicy || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, warrantyPolicy: e.target.value }))
                }
                className="mt-1.5 block w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Fulfillment Logistics */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <RotateCcw className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Fulfillment Settings & SLA Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="standardHandlingDays"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Handling Time (Days)
              </label>
              <input
                id="standardHandlingDays"
                type="number"
                min={1}
                max={14}
                value={formData.fulfillmentSettings.standardHandlingDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fulfillmentSettings: {
                      ...prev.fulfillmentSettings,
                      standardHandlingDays: parseInt(e.target.value, 10) || 1,
                    },
                  }))
                }
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="returnWindowDays"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                Return Window (Days)
              </label>
              <input
                id="returnWindowDays"
                type="number"
                min={0}
                max={90}
                value={formData.fulfillmentSettings.returnWindowDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fulfillmentSettings: {
                      ...prev.fulfillmentSettings,
                      returnWindowDays: parseInt(e.target.value, 10) || 0,
                    },
                  }))
                }
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="shipsInternationally"
                className="block text-xs font-semibold uppercase text-muted-foreground"
              >
                International Shipping
              </label>
              <select
                id="shipsInternationally"
                value={formData.fulfillmentSettings.shipsInternationally ? 'true' : 'false'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fulfillmentSettings: {
                      ...prev.fulfillmentSettings,
                      shipsInternationally: e.target.value === 'true',
                    },
                  }))
                }
                className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="true">Enabled (Worldwide)</option>
                <option value="false">Domestic Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" disabled={saving} className="px-8">
            {saving ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
