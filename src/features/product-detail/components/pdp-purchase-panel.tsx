/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — PURCHASE PANEL COMPONENT
 * ==============================================================================
 * Customer purchasing intent hub with bounded quantity control, multi-vendor
 * seller attribution, and non-persistent Phase 3 integration boundary.
 */

'use client';

import * as React from 'react';
import { ShoppingCart, Zap, CheckCircle2, X } from 'lucide-react';
import { formatMoneyMinor, multiplyMoney } from '@/domains/catalog/utils/money';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import type { Product } from '@/domains/catalog/types/product';
import type { ProductVariant } from '@/domains/catalog/types/variant';
import { QuantityControl } from '@/components/ui/quantity-control/quantity-control';
import { Button } from '@/components/ui/button/button';
import { useI18n } from '@/lib/i18n';
import type { PdpPurchaseIntentPayload } from '../types';

export interface PdpPurchasePanelProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
  selectedOffer?: SellerOffer | null;
  quantity: number;
  maxQuantity: number;
  isQuantityBoundedByDemo: boolean;
  canPurchase: boolean;
  onSetQuantity: (qty: number) => void;
  onPurchaseIntent?: (payload: PdpPurchaseIntentPayload) => void;
}

export function PdpPurchasePanel({
  product,
  selectedVariant,
  selectedOffer,
  quantity,
  maxQuantity,
  isQuantityBoundedByDemo,
  canPurchase,
  onSetQuantity,
  onPurchaseIntent,
}: PdpPurchasePanelProps): React.JSX.Element {
  const { t, locale } = useI18n();
  const formatLocale = locale === 'en' ? 'en-US' : locale;

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [capturedPayload, setCapturedPayload] = React.useState<PdpPurchaseIntentPayload | null>(
    null
  );

  const handleAction = (): void => {
    if (!canPurchase || !selectedOffer) return;

    const payload: PdpPurchaseIntentPayload = {
      productId: product.id,
      variantId: selectedVariant?.id,
      offerId: selectedOffer.offerId,
      sellerId: selectedOffer.sellerId,
      quantity,
      price: selectedOffer.price,
      timestamp: new Date().toISOString(),
    };

    setCapturedPayload(payload);
    setIsModalOpen(true);
    onPurchaseIntent?.(payload);
  };

  const sellerName = selectedOffer?.seller.name ?? '–';
  const fulfillmentName =
    selectedOffer?.fulfillmentType === 'marketplace_fulfilled'
      ? 'Marketplace Global Logistics'
      : sellerName;

  const totalPrice = selectedOffer ? multiplyMoney(selectedOffer.price, quantity) : null;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface p-4 sm:p-5 shadow-xs">
        {/* Merchant & Fulfillment attribution */}
        {selectedOffer && (
          <div className="flex flex-col gap-1.5 pb-3 border-b border-border-subtle text-xs">
            <div className="flex justify-between">
              <span className="text-fg-muted">{t('pdp.soldBy')}</span>
              <span className="font-semibold text-fg-primary">{sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">{t('pdp.shipsFrom')}</span>
              <span className="font-medium text-fg-primary">{fulfillmentName}</span>
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-fg-primary">{t('pdp.quantity')}</span>
            {selectedOffer?.inventory.quantityAvailable && (
              <span className="text-fg-subtle">
                Max: {selectedOffer.inventory.quantityAvailable}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <QuantityControl
              value={quantity}
              onChange={onSetQuantity}
              min={1}
              max={maxQuantity}
              disabled={!canPurchase}
            />

            {totalPrice && (
              <span className="text-xs font-semibold text-fg-muted tabular-nums">
                Total: {formatMoneyMinor(totalPrice, { locale: formatLocale })}
              </span>
            )}
          </div>

          {isQuantityBoundedByDemo && (
            <span className="text-2xs text-fg-subtle">{t('pdp.quantityDemoBound')}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={!canPurchase}
            onClick={handleAction}
            className="w-full font-bold cursor-pointer"
          >
            <ShoppingCart className="size-4" />
            <span>{t('pdp.addToCart')}</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={!canPurchase}
            onClick={handleAction}
            className="w-full font-bold cursor-pointer"
          >
            <Zap className="size-4" />
            <span>{t('pdp.buyNow')}</span>
          </Button>
        </div>
      </div>

      {/* Accessible Phase 3 Integration Intent Modal */}
      {isModalOpen && capturedPayload && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="intent-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border-default bg-surface p-6 shadow-xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 rounded-full p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg-primary transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col gap-4 text-start">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 id="intent-modal-title" className="text-lg font-bold text-fg-primary">
                  {t('pdp.intentModalTitle')}
                </h3>
              </div>

              <p className="text-sm text-fg-muted leading-relaxed">{t('pdp.intentModalDesc')}</p>

              {/* Payload Breakdown */}
              <div className="rounded-lg border border-border-subtle bg-surface-subtle p-3.5 text-xs flex flex-col gap-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-fg-muted">Product:</span>
                  <span className="font-semibold text-fg-primary truncate max-w-48">
                    {product.slug}
                  </span>
                </div>
                {capturedPayload.variantId && (
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Variant:</span>
                    <span className="text-fg-primary">{capturedPayload.variantId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-fg-muted">Merchant:</span>
                  <span className="text-fg-primary">{sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted">Quantity:</span>
                  <span className="text-fg-primary font-bold">{capturedPayload.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-muted">Unit Price:</span>
                  <span className="text-fg-primary">
                    {formatMoneyMinor(capturedPayload.price, { locale: formatLocale })}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsModalOpen(false)}
                className="w-full font-semibold cursor-pointer"
              >
                {t('pdp.intentModalClose')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
