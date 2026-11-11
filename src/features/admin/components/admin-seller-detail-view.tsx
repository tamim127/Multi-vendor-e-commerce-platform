'use client';

/**
 * ==============================================================================
 * ADMIN SELLER DETAIL & MODERATION VIEW
 * ==============================================================================
 * In-depth merchant KYC inspection, business credentials, catalog offers, fulfillment
 * capabilities, and administrative status decisions.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { SellerStatus } from '@/domains/seller/types/seller';
import {
  DEMO_SELLER_PROFILE,
  DEMO_PENDING_APPLICATION,
} from '@/domains/seller/fixtures/seller.fixture';
import { MOCK_SELLERS } from '@/domains/catalog/fixtures/sellers.fixture';
import { Button } from '@/components/ui/button/button';
import {
  ArrowLeft,
  Store,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export interface AdminSellerDetailViewProps {
  sellerId: string;
}

export function AdminSellerDetailView({ sellerId }: AdminSellerDetailViewProps): React.JSX.Element {
  const { sellerStatuses, moderateSeller, hasPermission } = useAdmin();

  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canModerate = hasPermission('sellers:moderate');

  // Match profile from demo fixtures or mock sellers
  const isPendingApp =
    sellerId === DEMO_PENDING_APPLICATION.storeSlug ||
    sellerId === DEMO_PENDING_APPLICATION.applicationId;

  const mockSeller = MOCK_SELLERS.find((s) => s.id === sellerId || s.slug === sellerId);

  const storeName = isPendingApp
    ? DEMO_PENDING_APPLICATION.storeName
    : mockSeller?.name || DEMO_SELLER_PROFILE.name;

  const legalName = isPendingApp
    ? DEMO_PENDING_APPLICATION.businessInfo.legalBusinessName
    : DEMO_SELLER_PROFILE.businessInfo.legalBusinessName;

  const taxId = isPendingApp
    ? DEMO_PENDING_APPLICATION.businessInfo.taxIdentificationNumber
    : DEMO_SELLER_PROFILE.businessInfo.taxIdentificationNumber;

  const regNo = isPendingApp
    ? DEMO_PENDING_APPLICATION.businessInfo.registrationNumber
    : DEMO_SELLER_PROFILE.businessInfo.registrationNumber;

  const email = isPendingApp
    ? DEMO_PENDING_APPLICATION.businessInfo.contactPerson.email
    : DEMO_SELLER_PROFILE.email;

  const phone = isPendingApp
    ? DEMO_PENDING_APPLICATION.businessInfo.contactPerson.phone
    : DEMO_SELLER_PROFILE.businessInfo.contactPerson.phone;

  const address = isPendingApp
    ? DEMO_PENDING_APPLICATION.businessInfo.businessAddress
    : DEMO_SELLER_PROFILE.businessInfo.businessAddress;

  const currentStatus: SellerStatus =
    sellerStatuses[sellerId] || (isPendingApp ? 'pending' : 'approved');

  const handleModeration = async (status: SellerStatus): Promise<void> => {
    setSubmitting(true);
    try {
      await moderateSeller(sellerId, status, `Admin decision: ${status}`, adminNote);
      setAdminNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/sellers"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Merchant Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{storeName}</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground font-mono">
              {sellerId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/store/${sellerId}`} target="_blank">
            <Button variant="tertiary" size="sm">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Storefront Preview
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Business & KYC Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Legal Business Credentials */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Verified Business Information</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground">Legal Business Name</span>
                <p className="font-semibold text-foreground mt-0.5">{legalName}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Registration / Business License</span>
                <p className="font-mono font-semibold text-foreground mt-0.5">{regNo}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Tax Identification / VAT</span>
                <p className="font-mono font-semibold text-foreground mt-0.5">{taxId}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Official Corporate Email</span>
                <p className="font-semibold text-foreground mt-0.5">{email}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Direct Contact Phone</span>
                <p className="font-semibold text-foreground mt-0.5">{phone}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Registered Domicile Address</span>
                <p className="text-foreground mt-0.5">
                  {address.street}, {address.city}, {address.state} {address.postalCode},{' '}
                  {address.country}
                </p>
              </div>
            </div>
          </div>

          {/* Store SLA & Fulfillment Defaults */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Operational Policies & SLAs</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Standard Handling Time</span>
                <p className="text-sm font-bold text-foreground mt-1">1 Business Day</p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Return Window</span>
                <p className="text-sm font-bold text-foreground mt-1">30 Days</p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Restocking Fee</span>
                <p className="text-sm font-bold text-foreground mt-1">0% (Waived)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Moderation Decision Panel */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Merchant Status</h2>
            <div className="mt-3 flex items-center justify-between border-y border-border py-3">
              <span className="text-xs text-muted-foreground">Current State:</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary uppercase">
                {currentStatus}
              </span>
            </div>

            {canModerate ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="admin-notes" className="text-xs font-medium text-foreground">
                    Administrative Review Notes (Optional)
                  </label>
                  <textarea
                    id="admin-notes"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter compliance rationale or review remarks..."
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  {currentStatus !== 'approved' && (
                    <Button
                      variant="primary"
                      className="w-full justify-center"
                      disabled={submitting}
                      onClick={() => handleModeration('approved')}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Approve Merchant Status
                    </Button>
                  )}

                  {currentStatus === 'approved' && (
                    <Button
                      variant="destructive"
                      className="w-full justify-center"
                      disabled={submitting}
                      onClick={() => handleModeration('suspended')}
                    >
                      <AlertTriangle className="mr-1.5 h-4 w-4" />
                      Suspend Merchant Privileges
                    </Button>
                  )}

                  {currentStatus !== 'rejected' && currentStatus !== 'approved' && (
                    <Button
                      variant="destructive"
                      className="w-full justify-center"
                      disabled={submitting}
                      onClick={() => handleModeration('rejected')}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Decline Application
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground italic">
                You do not have permission to moderate merchant statuses.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
