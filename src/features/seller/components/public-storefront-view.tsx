'use client';

/**
 * ==============================================================================
 * PUBLIC SELLER STOREFRONT VIEW
 * ==============================================================================
 * Customer-facing merchant storefront at /store/[slug].
 * Renders merchant verification status, rating feedback, commercial policies,
 * and canonical product cards offered by this vendor.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSeller } from '../context/seller-context';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { ProductCard } from '@/components/product-card/product-card';
import { Container } from '@/components/layout/container/container';
import { Button } from '@/components/ui/button/button';
import { ShieldCheck, Star, Truck, RotateCcw, Shield, Mail, Store, ArrowLeft } from 'lucide-react';

export interface PublicStorefrontViewProps {
  slug: string;
}

export function PublicStorefrontView({ slug }: PublicStorefrontViewProps): React.JSX.Element {
  const { getStorefrontBySlug, allProducts } = useSeller();
  const [activeTab, setActiveTab] = useState<'products' | 'policies' | 'about'>('products');

  const result = getStorefrontBySlug(slug);

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 bg-muted/20">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Merchant Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No active marketplace storefront registered under &quot;{slug}&quot;.
          </p>
          <div className="mt-6">
            <Button asChild variant="primary">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Marketplace
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const { storefront, activeOffers } = result;

  // Find products that have active offers from this seller
  const offerProductIds = new Set(activeOffers.map((o: SellerOffer) => o.productId));
  const sellerProducts = allProducts.filter((p) => offerProductIds.has(p.id));

  const displayProducts = sellerProducts.length > 0 ? sellerProducts : allProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-muted/10 pb-16">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-muted">
        {storefront.bannerUrl ? (
          <Image
            src={storefront.bannerUrl}
            alt={storefront.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary/80 to-primary/40" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Store Header Card */}
      <Container className="relative -mt-16 sm:-mt-20">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md">
                {storefront.logoUrl ? (
                  <Image
                    src={storefront.logoUrl}
                    alt={storefront.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-primary-foreground">
                    {storefront.name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {storefront.name}
                  </h1>
                  {storefront.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Merchant
                    </span>
                  )}
                  {storefront.badges.includes('authorized_dealer') && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Authorized Dealer
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {storefront.tagline || 'Direct from Certified Marketplace Vendor'}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>{storefront.rating.average.toFixed(1)}</span>
                    <span className="text-muted-foreground font-normal">
                      ({storefront.rating.count.toLocaleString()} ratings)
                    </span>
                  </div>
                  <span>•</span>
                  <span>Joined {storefront.memberSinceYear}</span>
                  <span>•</span>
                  <span>{activeOffers.length} Active Listings</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="tertiary" size="sm" className="text-xs">
                <a href="mailto:support@marketplace.demo">
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Contact Support
                </a>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 border-t border-border pt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Catalog Products ({displayProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('policies')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'policies'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Shipping & Policies
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'about'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              About Seller
            </button>
          </div>
        </div>
      </Container>

      {/* Tab Content */}
      <Container className="mt-8">
        {/* Products Grid */}
        {activeTab === 'products' && (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <Truck className="h-5 w-5" />
                <h3>Shipping & Dispatch SLA</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {storefront.policies.shipping ||
                  'Dispatches within 1-2 business days with insured delivery tracking.'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <RotateCcw className="h-5 w-5" />
                <h3>Returns & Refunds</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {storefront.policies.returns ||
                  '30-day return window on factory-sealed items. Full refund processed upon inspection.'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <Shield className="h-5 w-5" />
                <h3>Warranty & Guarantee</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {storefront.policies.warranty ||
                  '100% genuine brand manufacturer warranty coverage included with serial verification.'}
              </p>
            </div>
          </div>
        )}

        {/* About Seller Tab */}
        {activeTab === 'about' && (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">About {storefront.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {storefront.description ||
                  'Authorized premier distributor dedicated to providing authentic consumer and enterprise goods.'}
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
