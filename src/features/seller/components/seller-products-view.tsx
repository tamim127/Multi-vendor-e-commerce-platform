'use client';

/**
 * ==============================================================================
 * SELLER PRODUCTS & OFFERS MANAGEMENT VIEW
 * ==============================================================================
 * Manages seller commercial offers attached to canonical catalog products.
 * Supports pricing updates, promotional compare-at prices, condition flags,
 * Buy Box winner indicators, and offer activation/deactivation.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { useSeller } from '../context/seller-context';
import type { SellerOffer, SellerOfferCondition } from '@/domains/catalog/types/seller-offer';
import type { Product } from '@/domains/catalog/types/product';
import type { SellerOfferUpsertInput } from '@/domains/seller/types/offer';
import { SellerOfferUpsertSchema } from '@/domains/seller/schemas/offer.schema';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import { Spinner } from '@/components/ui/spinner/spinner';
import { Search, PlusCircle, Edit2, Award, CheckCircle2, XCircle, X } from 'lucide-react';

export function SellerProductsView(): React.JSX.Element {
  const { offers, allProducts, upsertOffer } = useSeller();
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'buy_box'>(
    'all'
  );
  const [editingOffer, setEditingOffer] = useState<{
    offer?: SellerOffer;
    product: Product;
    variantId?: string;
  } | null>(null);

  // Edit Modal State
  const [priceMajor, setPriceMajor] = useState<string>('99.99');
  const [compareAtMajor, setCompareAtMajor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(50);
  const [condition, setCondition] = useState<SellerOfferCondition>('new');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    const product = allProducts.find((p) => p.id === offer.productId);
    const titleMatch = product?.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const skuMatch = offer.variantId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;

    if (searchQuery && !titleMatch && !skuMatch) return false;

    const offerIsActive = (offer.inventory.quantityAvailable ?? 0) > 0;
    if (statusFilter === 'active') return offerIsActive;
    if (statusFilter === 'inactive') return !offerIsActive;
    if (statusFilter === 'buy_box') return offer.isBuyBoxWinner;

    return true;
  });

  const openEditModal = (offer: SellerOffer): void => {
    const product = allProducts.find((p) => p.id === offer.productId);
    if (!product) return;

    setEditingOffer({ offer, product, variantId: offer.variantId });
    setPriceMajor((offer.price.amountMinor / 100).toFixed(2));
    setCompareAtMajor(
      offer.compareAtPrice ? (offer.compareAtPrice.amountMinor / 100).toFixed(2) : ''
    );
    setQuantity(offer.inventory.quantityAvailable ?? 0);
    setCondition(offer.condition);
    setIsActive(true);
    setFormError(null);
  };

  const openAddOfferModal = (product: Product): void => {
    const defaultVariant = product.variants[0];
    setEditingOffer({ product, variantId: defaultVariant?.id });
    setPriceMajor('199.99');
    setCompareAtMajor('249.99');
    setQuantity(25);
    setCondition('new');
    setIsActive(true);
    setFormError(null);
  };

  const handleSaveOffer = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingOffer) return;
    setFormError(null);

    const priceMinor = Math.round(parseFloat(priceMajor) * 100);
    const compareAtMinor = compareAtMajor
      ? Math.round(parseFloat(compareAtMajor) * 100)
      : undefined;

    const payload: SellerOfferUpsertInput = {
      productId: editingOffer.product.id,
      variantId: editingOffer.variantId || editingOffer.product.defaultVariantId,
      price: { amountMinor: priceMinor, currency: 'USD' },
      compareAtPrice: compareAtMinor ? { amountMinor: compareAtMinor, currency: 'USD' } : undefined,
      condition,
      fulfillmentType: 'marketplace_fulfilled',
      quantityAvailable: quantity,
      leadTimeDays: 1,
      shippingEstimate: {
        minDays: 2,
        maxDays: 4,
        isFreeShipping: priceMinor > 5000,
      },
      warranty: {
        durationMonths: 12,
        provider: 'manufacturer',
      },
      returnPolicyDays: 30,
      isActive,
    };

    const validation = SellerOfferUpsertSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || 'Invalid offer data');
      return;
    }

    setSaving(true);
    try {
      await upsertOffer(validation.data);
      setEditingOffer(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search offers by product title or SKU..."
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-input bg-background p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({offers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('buy_box')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === 'buy_box'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Buy Box
            </button>
          </div>

          {allProducts.length > offers.length && (
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => {
                const unlistedProduct = allProducts.find(
                  (p) => !offers.some((o) => o.productId === p.id)
                );
                if (unlistedProduct) openAddOfferModal(unlistedProduct);
              }}
              className="text-xs"
            >
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              New Offer
            </Button>
          )}
        </div>
      </div>

      {/* Offers Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">Product & SKU</th>
                <th className="px-6 py-3.5">Condition</th>
                <th className="px-6 py-3.5">Offer Price</th>
                <th className="px-6 py-3.5">Inventory</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No commercial offers found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => {
                  const product = allProducts.find((p) => p.id === offer.productId);
                  const imageUrl = product?.media[0]?.url;
                  const qty = offer.inventory.quantityAvailable ?? 0;

                  return (
                    <tr key={offer.offerId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            {imageUrl && (
                              <Image
                                src={imageUrl}
                                alt={product?.title.en || 'Product thumbnail'}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground line-clamp-1">
                              {product?.title.en || offer.productId}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              <span className="font-mono">{offer.variantId || 'Standard SKU'}</span>
                              {offer.isBuyBoxWinner && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                                  <Award className="h-3 w-3" />
                                  Buy Box Winner
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="capitalize text-xs font-medium text-muted-foreground">
                          {offer.condition.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <span className="font-semibold text-foreground">
                            {formatMoneyMinor(offer.price)}
                          </span>
                          {offer.compareAtPrice && (
                            <span className="ml-2 text-xs text-muted-foreground line-through">
                              {formatMoneyMinor(offer.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            qty <= 5
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {qty} units
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            qty > 0
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {qty > 0 ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {qty > 0 ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(offer)}
                          className="h-8 text-xs"
                        >
                          <Edit2 className="mr-1 h-3 w-3" />
                          {t('seller.editOffer')}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Upsert Offer Modal */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {editingOffer.offer ? 'Edit Commercial Offer' : 'Create Commercial Offer'}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {editingOffer.product.title.en}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOffer(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="priceMajor"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Offer Price ($ USD) *
                  </label>
                  <input
                    id="priceMajor"
                    type="number"
                    step="0.01"
                    min="1"
                    value={priceMajor}
                    onChange={(e) => setPriceMajor(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="compareAtMajor"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    List / MSRP Price ($ USD)
                  </label>
                  <input
                    id="compareAtMajor"
                    type="number"
                    step="0.01"
                    min="1"
                    value={compareAtMajor}
                    onChange={(e) => setCompareAtMajor(e.target.value)}
                    placeholder="Optional compare price"
                    className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Available Stock *
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                    className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="condition"
                    className="block text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Condition
                  </label>
                  <select
                    id="condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as SellerOfferCondition)}
                    className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="new">Brand New</option>
                    <option value="refurbished_excellent">Refurbished - Excellent</option>
                    <option value="refurbished_good">Refurbished - Good</option>
                    <option value="used_like_new">Used - Like New</option>
                    <option value="used_good">Used - Good</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setEditingOffer(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={saving}>
                  {saving && <Spinner size="sm" className="mr-2" />}
                  Save Offer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
