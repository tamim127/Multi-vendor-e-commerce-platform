'use client';

/**
 * ==============================================================================
 * SELLER ONBOARDING & APPLICATION VIEW
 * ==============================================================================
 * Multi-vendor registration interface.
 * Captures store details, legal business credentials, tax info, and contact person.
 * Includes demo auto-fill and instant demo approval simulation for evaluation.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSeller } from '../context/seller-context';
import { SellerApplicationSchema } from '@/domains/seller/schemas/application.schema';
import type { SellerApplicationInput } from '@/domains/seller/types/application';
import { useTranslation } from '@/lib/i18n';
import { Container } from '@/components/layout/container/container';
import { Button } from '@/components/ui/button/button';
import { Spinner } from '@/components/ui/spinner/spinner';
import {
  Store,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function SellerOnboardingView(): React.JSX.Element {
  const { isApproved, application, submitApplication, autoApproveDemoApplication } = useSeller();
  const { t } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState<SellerApplicationInput>({
    storeName: '',
    storeSlug: '',
    storeDescription: '',
    businessCategory: 'Consumer Electronics & Computing',
    businessInfo: {
      legalBusinessName: '',
      registrationNumber: '',
      taxIdentificationNumber: '',
      businessType: 'llc',
      countryOfRegistration: 'US',
      businessAddress: {
        street: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      },
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        role: 'Founder / Managing Director',
      },
    },
    agreedToTerms: false,
    agreedToFeeStructure: false,
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);

  // Auto-generate slug from store name
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      storeName: val,
      storeSlug: slug,
    }));
  };

  // Quick fill demo credentials
  const fillDemoData = (): void => {
    setFormData({
      storeName: 'OmniTrade Direct',
      storeSlug: 'omnitrade-direct',
      storeDescription:
        'Authorized distributor of tier-1 consumer electronics, enterprise hardware, and certified accessories with global warranty coverage.',
      businessCategory: 'Consumer Electronics & Computing',
      businessInfo: {
        legalBusinessName: 'OmniTrade Solutions Global LLC',
        registrationNumber: 'REG-2026-99881',
        taxIdentificationNumber: 'EIN-84-9981245',
        businessType: 'llc',
        countryOfRegistration: 'US',
        businessAddress: {
          street: '100 Commerce Plaza Blvd, Suite 400',
          street2: '',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'US',
        },
        contactPerson: {
          name: 'Sarah Jenkins',
          email: 'merchant.lead@omnitrade.io',
          phone: '+1-512-555-0199',
          role: 'Director of Marketplace Operations',
        },
      },
      agreedToTerms: true,
      agreedToFeeStructure: true,
    });
    setErrors({});
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    const result = SellerApplicationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await submitApplication(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Instant Demo Approval
  const handleInstantApproval = async (): Promise<void> => {
    setApproving(true);
    try {
      await autoApproveDemoApplication();
      router.push('/seller');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <Container className="max-w-4xl">
        {/* If Already Approved */}
        {isApproved && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">{t('seller.approved')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your merchant account is active and verified. You have full access to manage offers,
              orders, and inventory.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild variant="primary">
                <Link href="/seller">
                  Go to Seller Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* If Pending Approval */}
        {application && application.status !== 'approved' && !isApproved && (
          <div className="rounded-2xl border border-amber-500/30 bg-card p-8 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <Clock className="h-8 w-8" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                    {t('seller.pendingApproval')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Application ID: {application.applicationId}
                  </span>
                </div>
                <h3 className="mt-1 text-xl font-bold text-foreground">
                  {application.storeName} ({application.storeSlug})
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your marketplace merchant application is pending manual compliance review. In
                  production, this process takes 24-48 business hours.
                </p>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={handleInstantApproval}
                  disabled={approving}
                  className="w-full sm:w-auto shadow-sm"
                >
                  {approving ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {t('seller.demoAutoApprove')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header / Intro */}
        <div className="text-center mb-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('seller.onboardingTitle')}
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
            {t('seller.onboardingSubtitle')}
          </p>

          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onClick={fillDemoData}
              className="text-xs text-primary"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Auto-fill Demo Application
            </Button>
          </div>
        </div>

        {/* Application Form */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Section 1: Storefront Identity */}
            <div>
              <h2 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2">
                1. Marketplace Storefront Identity
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="storeName"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Public Store Name *
                  </label>
                  <input
                    id="storeName"
                    type="text"
                    value={formData.storeName}
                    onChange={handleStoreNameChange}
                    placeholder="e.g. Acme Tech Direct"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['storeName'] && (
                    <p className="mt-1 text-xs text-destructive">{errors['storeName']}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="storeSlug"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Store URL Identifier (Slug) *
                  </label>
                  <div className="mt-1.5 flex rounded-xl border border-input bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <span className="inline-flex items-center px-3 text-xs text-muted-foreground border-r border-border bg-muted/30 rounded-l-xl">
                      /store/
                    </span>
                    <input
                      id="storeSlug"
                      type="text"
                      value={formData.storeSlug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, storeSlug: e.target.value }))
                      }
                      placeholder="acme-tech-direct"
                      className="block w-full border-0 bg-transparent px-3 py-2.5 text-sm text-foreground focus:outline-none rounded-r-xl"
                    />
                  </div>
                  {errors['storeSlug'] && (
                    <p className="mt-1 text-xs text-destructive">{errors['storeSlug']}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="businessCategory"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Primary Product Category *
                  </label>
                  <select
                    id="businessCategory"
                    value={formData.businessCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, businessCategory: e.target.value }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Consumer Electronics & Computing">
                      Consumer Electronics & Computing
                    </option>
                    <option value="Audio & Smart Home">Audio & Smart Home</option>
                    <option value="Industrial & Enterprise">Industrial & Enterprise</option>
                    <option value="Gaming & Accessories">Gaming & Accessories</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="storeDescription"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Storefront Description (Min 20 characters) *
                  </label>
                  <textarea
                    id="storeDescription"
                    rows={3}
                    value={formData.storeDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, storeDescription: e.target.value }))
                    }
                    placeholder="Tell buyers about your company, authorized dealer statuses, and catalog specialization..."
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['storeDescription'] && (
                    <p className="mt-1 text-xs text-destructive">{errors['storeDescription']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Legal Entity & Compliance */}
            <div>
              <h2 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2">
                2. Legal Entity & Regulatory Information
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="legalBusinessName"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Registered Legal Business Name *
                  </label>
                  <input
                    id="legalBusinessName"
                    type="text"
                    value={formData.businessInfo.legalBusinessName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          legalBusinessName: e.target.value,
                        },
                      }))
                    }
                    placeholder="Acme Trading Global Corporation"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['businessInfo.legalBusinessName'] && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors['businessInfo.legalBusinessName']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="registrationNumber"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Business Registration / License Number *
                  </label>
                  <input
                    id="registrationNumber"
                    type="text"
                    value={formData.businessInfo.registrationNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          registrationNumber: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. C-449102-X"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['businessInfo.registrationNumber'] && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors['businessInfo.registrationNumber']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="taxId"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Tax Identification / VAT Number *
                  </label>
                  <input
                    id="taxId"
                    type="text"
                    value={formData.businessInfo.taxIdentificationNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          taxIdentificationNumber: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. US-EIN-12-3456789"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['businessInfo.taxIdentificationNumber'] && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors['businessInfo.taxIdentificationNumber']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="businessType"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Legal Entity Structure
                  </label>
                  <select
                    id="businessType"
                    value={formData.businessInfo.businessType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          businessType: e.target
                            .value as SellerApplicationInput['businessInfo']['businessType'],
                        },
                      }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="llc">Limited Liability Company (LLC)</option>
                    <option value="corporation">Corporation (Inc / Corp / Ltd)</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="partnership">General Partnership</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="countryOfRegistration"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Country of Registration
                  </label>
                  <input
                    id="countryOfRegistration"
                    type="text"
                    value={formData.businessInfo.countryOfRegistration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          countryOfRegistration: e.target.value,
                        },
                      }))
                    }
                    placeholder="US"
                    maxLength={3}
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Headquarters Address */}
            <div>
              <h2 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2">
                3. Business Headquarters Address
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressStreet"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Street Address *
                  </label>
                  <input
                    id="addressStreet"
                    type="text"
                    value={formData.businessInfo.businessAddress.street}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          businessAddress: {
                            ...prev.businessInfo.businessAddress,
                            street: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="123 Commerce Boulevard, Suite 500"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['businessInfo.businessAddress.street'] && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors['businessInfo.businessAddress.street']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addressCity"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    City *
                  </label>
                  <input
                    id="addressCity"
                    type="text"
                    value={formData.businessInfo.businessAddress.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          businessAddress: {
                            ...prev.businessInfo.businessAddress,
                            city: e.target.value,
                          },
                        },
                      }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="addressState"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    State / Province *
                  </label>
                  <input
                    id="addressState"
                    type="text"
                    value={formData.businessInfo.businessAddress.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          businessAddress: {
                            ...prev.businessInfo.businessAddress,
                            state: e.target.value,
                          },
                        },
                      }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="addressPostalCode"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Postal / Zip Code *
                  </label>
                  <input
                    id="addressPostalCode"
                    type="text"
                    value={formData.businessInfo.businessAddress.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          businessAddress: {
                            ...prev.businessInfo.businessAddress,
                            postalCode: e.target.value,
                          },
                        },
                      }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="addressCountry"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Country Code (2 Letters) *
                  </label>
                  <input
                    id="addressCountry"
                    type="text"
                    maxLength={2}
                    value={formData.businessInfo.businessAddress.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          businessAddress: {
                            ...prev.businessInfo.businessAddress,
                            country: e.target.value.toUpperCase(),
                          },
                        },
                      }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Authorized Representative */}
            <div>
              <h2 className="text-lg font-semibold text-foreground border-b border-border/60 pb-2">
                4. Primary Merchant Contact
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contactName"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Representative Full Name *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    value={formData.businessInfo.contactPerson.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          contactPerson: {
                            ...prev.businessInfo.contactPerson,
                            name: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Sarah Jenkins"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['businessInfo.contactPerson.name'] && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors['businessInfo.contactPerson.name']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactRole"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Title / Corporate Role *
                  </label>
                  <input
                    id="contactRole"
                    type="text"
                    value={formData.businessInfo.contactPerson.role}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          contactPerson: {
                            ...prev.businessInfo.contactPerson,
                            role: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Managing Partner"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Corporate Email *
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={formData.businessInfo.contactPerson.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          contactPerson: {
                            ...prev.businessInfo.contactPerson,
                            email: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="ops@company.com"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['businessInfo.contactPerson.email'] && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors['businessInfo.contactPerson.email']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Direct Business Phone *
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={formData.businessInfo.contactPerson.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessInfo: {
                          ...prev.businessInfo,
                          contactPerson: {
                            ...prev.businessInfo.contactPerson,
                            phone: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="+1 555-0199"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors['businessInfo.contactPerson.phone'] && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors['businessInfo.contactPerson.phone']}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Agreement Checkboxes */}
            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-foreground">
                  I certify that I am an authorized corporate officer, and agree to the Marketplace
                  Merchant Participation Agreement, Anti-Counterfeiting Standards, and Warranty
                  Enforcement Policies.
                </span>
              </label>
              {errors['agreedToTerms'] && (
                <p className="text-xs text-destructive pl-7">{errors['agreedToTerms']}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToFeeStructure}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, agreedToFeeStructure: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-foreground">
                  I acknowledge the platform referral fee schedule (8-15% depending on category) and
                  automated multi-vendor disbursement settlement cycles.
                </span>
              </label>
              {errors['agreedToFeeStructure'] && (
                <p className="text-xs text-destructive pl-7">{errors['agreedToFeeStructure']}</p>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span>Verification takes 24-48 business hours upon submission</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting && <Spinner size="sm" className="mr-2" />}
                  {t('seller.applyNow')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
