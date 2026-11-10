'use client';

/**
 * ==============================================================================
 * SELLER GUARD COMPONENT
 * ==============================================================================
 * Route protection wrapper for /seller/* portal pages.
 * Ensures the user has an approved merchant status.
 * If unapproved, renders an interactive onboarding/approval gate with
 * instant demo evaluation unlock.
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSeller } from '../context/seller-context';
import { useTranslation } from '@/lib/i18n';
import { Spinner } from '@/components/ui/spinner/spinner';
import { Button } from '@/components/ui/button/button';
import { ShieldAlert, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export interface SellerGuardProps {
  children: React.ReactNode;
}

export function SellerGuard({ children }: SellerGuardProps): React.JSX.Element | null {
  const { isApproved, isLoading, status, autoApproveDemoApplication } = useSeller();
  const { t } = useTranslation();
  const router = useRouter();
  const [approving, setApproving] = React.useState(false);

  const handleInstantApproval = async (): Promise<void> => {
    setApproving(true);
    try {
      await autoApproveDemoApplication();
      router.refresh();
    } finally {
      setApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            {status === 'pending' ? (
              <Clock className="h-8 w-8" />
            ) : (
              <ShieldAlert className="h-8 w-8" />
            )}
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            {status === 'pending' ? t('seller.pendingApproval') : t('seller.onboardingTitle')}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground">
            {status === 'pending'
              ? 'Your marketplace merchant application has been submitted and is currently undergoing credential and catalog compliance review.'
              : t('seller.onboardingSubtitle')}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {status === 'pending' ? (
              <Button
                variant="primary"
                onClick={handleInstantApproval}
                disabled={approving}
                className="w-full sm:w-auto"
              >
                {approving ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {t('seller.demoAutoApprove')}
              </Button>
            ) : (
              <Button variant="primary" asChild className="w-full sm:w-auto">
                <Link href="/seller/register">
                  {t('seller.applyNow')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button variant="tertiary" asChild className="w-full sm:w-auto">
              <Link href="/">Return to Storefront</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
