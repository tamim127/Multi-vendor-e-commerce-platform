/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — NOT FOUND COMPONENT
 * ==============================================================================
 * Accessible empty/404 state presentation when product slug does not exist.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { useI18n } from '@/lib/i18n';

export function PdpNotFound(): React.JSX.Element {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center flex flex-col items-center justify-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-surface-muted text-fg-subtle mb-6">
        <PackageX className="size-10 stroke-1" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-primary mb-3">
        {t('pdp.notFoundTitle')}
      </h1>

      <p className="text-sm text-fg-muted leading-relaxed mb-8">{t('pdp.notFoundDesc')}</p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/products">
          <Button variant="primary" size="md">
            {t('pdp.backToCatalog')}
          </Button>
        </Link>
        <Link href="/">
          <Button variant="tertiary" size="md">
            {t('pdp.backToHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
