/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — SELLER OFFERS COMPONENT
 * ==============================================================================
 * Multi-vendor offer comparison table and selector.
 * Demonstrates transparent price competition, condition differentials,
 * fulfillment methods, and grounded seller demo badges.
 */

'use client';

import * as React from 'react';
import { Store, Check, Info, Star } from 'lucide-react';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { useI18n } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge/badge';

export interface PdpSellerOffersProps {
  eligibleOffers: SellerOffer[];
  selectedOffer?: SellerOffer | null;
  onSelectOffer: (offerId: string) => void;
}

export function PdpSellerOffers({
  eligibleOffers,
  selectedOffer,
  onSelectOffer,
}: PdpSellerOffersProps): React.JSX.Element {
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  if (eligibleOffers.length === 0) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-default bg-surface p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="size-4 text-primary" />
          <h3 className="text-sm font-bold text-fg-primary">
            {t('pdp.allOffers')} ({eligibleOffers.length})
          </h3>
        </div>
      </div>

      {/* Offers List */}
      <div className="flex flex-col gap-2.5">
        {eligibleOffers.map((offer) => {
          const isSelected = selectedOffer?.offerId === offer.offerId;
          const formattedPrice = formatMoneyMinor(offer.price, { locale: formatLocale });

          return (
            <div
              key={offer.offerId}
              onClick={() => onSelectOffer(offer.offerId)}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                  : 'border-border-default bg-surface hover:border-border-strong hover:bg-surface-subtle'
              }`}
            >
              {/* Merchant Details */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-fg-primary">{offer.seller.name}</span>

                  {offer.isBuyBoxWinner && (
                    <Badge variant="brand" size="sm" className="text-2xs font-bold">
                      {t('pdp.buyBoxWinner')}
                    </Badge>
                  )}

                  {offer.seller.isVerified && (
                    <Badge variant="neutral" size="sm" className="text-2xs">
                      {t('pdp.verifiedDemo')}
                    </Badge>
                  )}

                  {offer.seller.badges?.includes('official_store') && (
                    <Badge variant="brand" size="sm" className="text-2xs">
                      {t('pdp.officialStoreDemo')}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-fg-primary">
                      {offer.seller.rating.average.toFixed(1)}
                    </span>
                    <span className="text-fg-subtle">
                      ({offer.seller.rating.positiveFeedbackPercent}% positive)
                    </span>
                  </span>

                  <span className="text-fg-subtle">•</span>

                  <span className="capitalize text-fg-secondary">
                    {offer.condition.replace(/_/g, ' ')}
                  </span>

                  {offer.shippingEstimate?.isFreeShipping && (
                    <>
                      <span className="text-fg-subtle">•</span>
                      <span className="text-success font-medium">{t('pdp.freeDelivery')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price and Action Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                <span className="text-base sm:text-lg font-bold text-price tabular-nums">
                  {formattedPrice}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOffer(offer.offerId);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'border border-border-default bg-surface text-fg-primary hover:bg-surface-elevated'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="size-3.5" />
                      <span>{t('pdp.selectedOfferLabel')}</span>
                    </>
                  ) : (
                    <span>{t('pdp.selectOffer')}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prominent Demonstration Disclaimer */}
      <div className="flex items-start gap-2 rounded-md bg-surface-subtle p-2.5 text-2xs text-fg-muted leading-relaxed">
        <Info className="size-3.5 text-fg-subtle shrink-0 mt-0.5" />
        <p>{t('pdp.sellerDisclaimer')}</p>
      </div>
    </div>
  );
}
