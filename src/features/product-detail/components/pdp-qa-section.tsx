/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — Q&A SECTION COMPONENT
 * ==============================================================================
 * Customer community questions, merchant answers, and demonstration disclosures.
 */

'use client';

import * as React from 'react';
import { HelpCircle, Info, ThumbsUp } from 'lucide-react';
import type { DemoQaItem } from '../types';
import { Button } from '@/components/ui/button/button';
import { useI18n } from '@/lib/i18n';

export interface PdpQaSectionProps {
  qaList: DemoQaItem[];
}

export function PdpQaSection({ qaList }: PdpQaSectionProps): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          <h4 className="text-base font-bold text-fg-primary">
            {t('pdp.tabQa')} ({qaList.length})
          </h4>
        </div>

        <Button variant="tertiary" size="sm" className="text-xs">
          {t('pdp.askQuestion')}
        </Button>
      </div>

      {/* Demo Disclosure */}
      <div className="flex items-start gap-2 rounded-lg bg-surface-subtle p-3 text-xs text-fg-muted">
        <Info className="size-4 text-fg-subtle shrink-0 mt-0.5" />
        <p>{t('pdp.demoFeedbackNote')}</p>
      </div>

      {/* Q&A Items List */}
      {qaList.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface p-8 text-center text-fg-muted text-sm">
          {t('pdp.noQa')}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {qaList.map((qa) => (
            <div
              key={qa.id}
              className="flex flex-col gap-3 rounded-xl border border-border-default bg-surface p-4 shadow-xs"
            >
              {/* Question */}
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  Q
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-fg-primary">{qa.question}</p>
                  <span className="text-2xs text-fg-subtle">
                    Asked by {qa.askedBy} on{' '}
                    {new Date(qa.askedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Answer */}
              <div className="flex items-start gap-3 pl-2 sm:pl-3 border-l-2 border-primary/30">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-fg-secondary font-bold text-xs">
                  A
                </span>
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
                    {qa.answer}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-2xs text-fg-subtle">
                    <span className="font-medium text-fg-primary">{qa.answeredBy}</span>
                    {qa.isMerchantAnswer && (
                      <span className="rounded-xs bg-primary/10 px-1 py-0.5 font-semibold text-primary">
                        Merchant Verified
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(qa.answeredAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="size-2.5" />
                      {qa.helpfulCount} helpful
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
