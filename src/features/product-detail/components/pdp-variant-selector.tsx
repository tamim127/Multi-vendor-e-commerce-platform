/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — VARIANT SELECTOR COMPONENT
 * ==============================================================================
 * Multi-dimensional option selector matrix with swatch indicators, active rings,
 * accessible keyboard controls, and 5-state status notifications.
 */

'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { extractOptionMatrix } from '@/domains/catalog/utils/variant-matrix';
import type { ProductVariant } from '@/domains/catalog/types/variant';
import { useI18n, type TranslationKey } from '@/lib/i18n';

export interface PdpVariantSelectorProps {
  variants: ProductVariant[];
  selectedOptions: Record<string, string>;
  onSelectOption: (key: string, value: string) => void;
  statusMessageKey?: string | null;
}

export function PdpVariantSelector({
  variants,
  selectedOptions,
  onSelectOption,
  statusMessageKey,
}: PdpVariantSelectorProps): React.JSX.Element {
  const { t, locale } = useI18n();

  const dimensions = React.useMemo(() => {
    return extractOptionMatrix(variants);
  }, [variants]);

  if (dimensions.length === 0) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-5 py-3">
      {/* Dimensions Matrix */}
      {dimensions.map((dim) => {
        const attributeLabel =
          dim.attributeLabel[locale as keyof typeof dim.attributeLabel] ?? dim.attributeLabel.en;
        const currentSelectedValue = selectedOptions[dim.attributeKey];

        // Find current display text for selected option
        const currentOptionObj = dim.values.find((v) => v.value === currentSelectedValue);
        const currentDisplayValue = currentOptionObj
          ? (currentOptionObj.displayValue[locale as keyof typeof currentOptionObj.displayValue] ??
            currentOptionObj.displayValue.en)
          : null;

        return (
          <div key={dim.attributeKey} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-fg-primary">
                {attributeLabel}
                {currentDisplayValue && (
                  <span className="font-normal text-fg-muted ml-1.5">: {currentDisplayValue}</span>
                )}
              </span>
            </div>

            <div
              role="radiogroup"
              aria-label={attributeLabel}
              className="flex flex-wrap items-center gap-2"
            >
              {dim.values.map((val) => {
                const isSelected = currentSelectedValue === val.value;
                const valueLabel =
                  val.displayValue[locale as keyof typeof val.displayValue] ?? val.displayValue.en;

                // Color swatch mode
                if (val.swatch && val.swatch.startsWith('#')) {
                  return (
                    <button
                      key={val.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${attributeLabel}: ${valueLabel}`}
                      onClick={() => onSelectOption(dim.attributeKey, val.value)}
                      style={{ backgroundColor: val.swatch }}
                      className={`relative size-9 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface scale-105 shadow-xs'
                          : 'border border-border-default/40 hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                      title={valueLabel}
                    />
                  );
                }

                // Standard pill button
                return (
                  <button
                    key={val.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelectOption(dim.attributeKey, val.value)}
                    className={`min-w-16 rounded-md px-3.5 py-2 text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? 'border-2 border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border border-border-default bg-surface text-fg-primary hover:border-border-strong hover:bg-surface-subtle'
                    }`}
                  >
                    {valueLabel}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Status Warning Banner (e.g. inactive variant or no offers) */}
      {statusMessageKey && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-fg"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-warning" />
          <p className="leading-relaxed font-medium">{t(statusMessageKey as TranslationKey)}</p>
        </div>
      )}
    </div>
  );
}
