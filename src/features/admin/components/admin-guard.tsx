'use client';

/**
 * ==============================================================================
 * ADMIN GUARD COMPONENT
 * ==============================================================================
 * Strict route protection wrapper for /admin/* portal pages.
 * Enforces fail-closed permission authorization.
 * If unauthorized, renders an explicit Access Denied state explaining missing permissions
 * and providing a demo role switcher for architectural evaluation.
 */

import React from 'react';
import Link from 'next/link';
import { useAdmin } from '../context/admin-context';
import type { AdminPermission } from '@/domains/admin';
import { Spinner } from '@/components/ui/spinner/spinner';
import { Button } from '@/components/ui/button/button';
import { ShieldAlert, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export interface AdminGuardProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
  requiredPermissions?: AdminPermission[];
  requireAll?: boolean;
}

export function AdminGuard({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
}: AdminGuardProps): React.JSX.Element | null {
  const {
    currentRole,
    setCurrentRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  } = useAdmin();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Evaluate permission requirements
  let isAuthorized = true;
  let missingPermDescription = '';

  if (requiredPermission) {
    isAuthorized = hasPermission(requiredPermission);
    if (!isAuthorized) {
      missingPermDescription = `Requires permission: '${requiredPermission}'`;
    }
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    isAuthorized = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    if (!isAuthorized) {
      missingPermDescription = requireAll
        ? `Requires all permissions: [${requiredPermissions.join(', ')}]`
        : `Requires any permission from: [${requiredPermissions.join(', ')}]`;
    }
  }

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            {t('admin.accessDenied') || 'Access Restricted: Permission Required'}
          </h2>

          <p className="mt-3 text-sm text-muted-foreground">
            {t('admin.accessDeniedDesc') ||
              'Your current administrative role does not possess authorization to view or manage this subsystem.'}
          </p>

          {missingPermDescription && (
            <div className="mt-4 inline-block rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground">
              {missingPermDescription}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <KeyRound className="h-4 w-4 text-primary" />
              <span>Simulated Demo Evaluation Switcher</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Switch to an authorized role to test this subsystem without server-side credential
              barriers:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant={currentRole === 'super_admin' ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setCurrentRole('super_admin')}
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Super Admin (Full Access)
              </Button>
              <Button
                variant={currentRole === 'catalog_manager' ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setCurrentRole('catalog_manager')}
              >
                Catalog Manager
              </Button>
              <Button
                variant={currentRole === 'order_manager' ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setCurrentRole('order_manager')}
              >
                Order Manager
              </Button>
              <Button
                variant={currentRole === 'finance_manager' ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setCurrentRole('finance_manager')}
              >
                Finance Manager
              </Button>
              <Button
                variant={currentRole === 'compliance_officer' ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setCurrentRole('compliance_officer')}
              >
                Compliance Officer
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/admin">
              <Button variant="tertiary" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Admin Overview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
