'use client';

/**
 * ==============================================================================
 * ADMIN PRODUCT DETAIL & CATALOG INSPECTION VIEW
 * ==============================================================================
 * Inspect canonical catalog product specifications, mapped multi-vendor seller offers,
 * SKU inventory, and administrative listing moderation.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { ProductModerationStatus } from '@/domains/admin';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures/products.fixture';
import { MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures/seller-offers.fixture';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Button } from '@/components/ui/button/button';
import {
  ArrowLeft,
  Package,
  Store,
  CheckCircle2,
  XCircle,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

export interface AdminProductDetailViewProps {
  productId: string;
}

export function AdminProductDetailView({
  productId,
}: AdminProductDetailViewProps): React.JSX.Element {
  const { productStatuses, moderateProduct, hasPermission } = useAdmin();

  const [reasonInput, setReasonInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canModerate = hasPermission('catalog:moderate');

  const product = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0]!;
  const offers = MOCK_SELLER_OFFERS.filter((o) => o.productId === productId);

  const titleEn = typeof product.title === 'object' ? product.title.en : String(product.title);
  const descEn =
    typeof product.description === 'object' ? product.description.en : String(product.description);

  const currentStatus: ProductModerationStatus =
    productStatuses[productId] || (product.status === 'active' ? 'approved' : 'pending_review');

  const handleStatusChange = async (newStatus: ProductModerationStatus): Promise<void> => {
    setSubmitting(true);
    try {
      await moderateProduct(productId, newStatus, reasonInput.trim() || undefined);
      setReasonInput('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Back navigation */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Product Catalog
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{titleEn}</h1>
            <span className="font-mono text-xs rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground">
              {product.id}
            </span>
          </div>

          <Link href={`/product/${product.slug}`} target="_blank">
            <Button variant="tertiary" size="sm">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Customer PDP View
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Product Info & Multi-Vendor Offers */}
        <div className="space-y-6 lg:col-span-2">
          {/* Canonical Specifications */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Canonical Specifications</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground">Product Title</span>
                <p className="font-semibold text-foreground mt-0.5">{titleEn}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Category Identifier</span>
                <p className="font-mono font-semibold text-foreground mt-0.5">
                  {product.categoryId}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Catalog Price Range</span>
                <p className="font-mono font-bold text-primary mt-0.5">
                  {product.offerSummary ? (
                    <>
                      {formatMinorToCurrency(product.offerSummary.lowestPrice.amountMinor, 'USD')} –{' '}
                      {formatMinorToCurrency(product.offerSummary.highestPrice.amountMinor, 'USD')}
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Variant SKU Count</span>
                <p className="font-bold text-foreground mt-0.5">
                  {product.variants?.length || 1} SKUs
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Description</span>
                <p className="text-foreground mt-0.5 leading-relaxed">{descEn}</p>
              </div>
            </div>
          </div>

          {/* Mapped Multi-Vendor Offers */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  Active Multi-Vendor Seller Offers ({offers.length})
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">Decoupled Commercial Offers</span>
            </div>

            <div className="mt-4 divide-y divide-border">
              {offers.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No active seller offers mapped to this product.
                </p>
              ) : (
                offers.map((offer) => (
                  <div
                    key={offer.offerId}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span>{offer.seller?.name || offer.sellerId}</span>
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        Seller ID: {offer.sellerId} · Condition: {offer.condition}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-primary">
                        {formatMinorToCurrency(offer.price.amountMinor, offer.price.currency)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {offer.inventory?.quantityAvailable ?? 'In'} stock
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Moderation Decision */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Listing Moderation</h2>
            <div className="mt-3 flex items-center justify-between border-y border-border py-3">
              <span className="text-xs text-muted-foreground">Catalog State:</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary uppercase">
                {currentStatus}
              </span>
            </div>

            {canModerate ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="moderation-reason"
                    className="text-xs font-medium text-foreground"
                  >
                    Moderation Rationale / Review Comments
                  </label>
                  <textarea
                    id="moderation-reason"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="Enter compliance or copyright notes..."
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
                      onClick={() => handleStatusChange('approved')}
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Approve for Marketplace
                    </Button>
                  )}

                  {currentStatus === 'approved' && (
                    <Button
                      variant="tertiary"
                      className="w-full justify-center"
                      disabled={submitting}
                      onClick={() => handleStatusChange('hidden')}
                    >
                      <EyeOff className="mr-1.5 h-4 w-4" />
                      Hide from Catalog Search
                    </Button>
                  )}

                  {currentStatus !== 'rejected' && (
                    <Button
                      variant="destructive"
                      className="w-full justify-center"
                      disabled={submitting}
                      onClick={() => handleStatusChange('rejected')}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Reject Product
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground italic">
                You do not have permission to moderate catalog products.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
