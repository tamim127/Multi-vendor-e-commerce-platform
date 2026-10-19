/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — AVAILABILITY COMPONENT
 * ==============================================================================
 * Live stock status indicators, low-stock warnings, and fulfillment turnaround.
 */

'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Truck, ShieldCheck, Clock } from 'lucide-react';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { useI18n } from '@/lib/i18n';
import { formatShippingEstimate } from '../utils/shipping';

export interface PdpAvailabilityProps {
  selectedOffer?: SellerOffer | null;
}

export function PdpAvailability({ selectedOffer }: PdpAvailabilityProps): React.JSX.Element {
  const { t, locale } = useI18n();

  if (!selectedOffer) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-fg-muted">
        <XCircle className="size-4 text-fg-subtle" />
        <span>{t('pdp.outOfStock')}</span>
      </div>
    );
  }

  const inventory = selectedOffer.inventory;
  const isQuantityValid =
    inventory.quantityAvailable === undefined ||
    (typeof inventory.quantityAvailable === 'number' &&
      Number.isFinite(inventory.quantityAvailable) &&
      Number.isInteger(inventory.quantityAvailable) &&
      inventory.quantityAvailable >= 0);

  const isBackorder = inventory.state === 'backorder';
  const isPermittedBackorder = isBackorder && inventory.allowsBackorder === true && isQuantityValid;
  const isProhibitedBackorder = isBackorder && !isPermittedBackorder;

  const isOutOfStock =
    !isQuantityValid ||
    isProhibitedBackorder ||
    inventory.state === 'out_of_stock' ||
    inventory.state === 'unavailable' ||
    inventory.quantityAvailable === 0;

  const isLowStock =
    !isOutOfStock &&
    !isBackorder &&
    typeof inventory.quantityAvailable === 'number' &&
    inventory.quantityAvailable > 0 &&
    inventory.quantityAvailable <= 5;

  const shippingDisplay = formatShippingEstimate(selectedOffer.shippingEstimate, {
    locale,
    freeDeliveryText: t('pdp.freeDelivery'),
    calculatedAtCheckoutText: t('pdp.shippingCalculatedAtCheckout'),
  });

  return (
    <div className="flex flex-col gap-2.5 py-1 text-xs">
      {/* Primary Stock Indicator */}
      <div className="flex items-center gap-2 font-semibold">
        {isPermittedBackorder ? (
          <>
            <Clock className="size-4 text-amber-500" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {t('pdp.backorder')}
              </span>
              {inventory.restockDate && (
                <span className="text-2xs text-fg-muted font-normal">
                  ({t('pdp.backorderRestock', { date: inventory.restockDate })})
                </span>
              )}
            </div>
          </>
        ) : isOutOfStock ? (
          <>
            <XCircle className="size-4 text-destructive" />
            <span className="text-destructive">
              {isProhibitedBackorder ? t('pdp.backorderProhibited') : t('pdp.outOfStock')}
            </span>
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
        <div className="flex items-center gap-1.5">
          <Truck className="size-3.5 text-fg-subtle" />
          <span className={shippingDisplay.isFree ? 'text-success font-medium' : undefined}>
            {shippingDisplay.label}
          </span>
          {shippingDisplay.detail && (
            <span className="text-fg-subtle">{shippingDisplay.detail}</span>
          )}
        </div>

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
