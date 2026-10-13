/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — AVAILABILITY COMPONENT
 * ==============================================================================
 * Live stock status indicators, low-stock warnings, and fulfillment turnaround.
 */

'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Truck, ShieldCheck } from 'lucide-react';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { useI18n } from '@/lib/i18n';

export interface PdpAvailabilityProps {
  selectedOffer?: SellerOffer | null;
}

export function PdpAvailability({ selectedOffer }: PdpAvailabilityProps): React.JSX.Element {
  const { t } = useI18n();

  if (!selectedOffer) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-fg-muted">
        <XCircle className="size-4 text-fg-subtle" />
        <span>{t('pdp.outOfStock')}</span>
      </div>
    );
  }

  const inventory = selectedOffer.inventory;
  const isOutOfStock = inventory.state === 'out_of_stock' || inventory.quantityAvailable === 0;
  const isLowStock =
    !isOutOfStock &&
    typeof inventory.quantityAvailable === 'number' &&
    inventory.quantityAvailable > 0 &&
    inventory.quantityAvailable <= 5;

  return (
    <div className="flex flex-col gap-2.5 py-1 text-xs">
      {/* Primary Stock Indicator */}
      <div className="flex items-center gap-2 font-semibold">
        {isOutOfStock ? (
          <>
            <XCircle className="size-4 text-destructive" />
            <span className="text-destructive">{t('pdp.outOfStock')}</span>
          </>
        ) : isLowStock ? (
          <>
            <AlertTriangle className="size-4 text-warning" />
            <span className="text-warning-fg font-bold">
              {t('pdp.lowStock', { count: inventory.quantityAvailable! })}
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-success">{t('pdp.inStock')}</span>
          </>
        )}
      </div>

      {/* Fulfillment & Shipping Details */}
      <div className="flex flex-wrap items-center gap-3 text-fg-muted">
        {selectedOffer.shippingEstimate && (
          <div className="flex items-center gap-1.5">
            <Truck className="size-3.5 text-fg-subtle" />
            <span>
              {selectedOffer.shippingEstimate.isFreeShipping
                ? t('pdp.freeDelivery')
                : t('pdp.delivery')}
              {selectedOffer.shippingEstimate.maxDays > 0 && (
                <span className="ml-1 text-fg-subtle">
                  ({selectedOffer.shippingEstimate.minDays}-{selectedOffer.shippingEstimate.maxDays}{' '}
                  days)
                </span>
              )}
            </span>
          </div>
        )}

        {selectedOffer.returnPolicyDays > 0 && (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-fg-subtle" />
            <span>{t('pdp.returnPolicy', { days: selectedOffer.returnPolicyDays })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
