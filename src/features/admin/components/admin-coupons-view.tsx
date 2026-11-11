'use client';

/**
 * ==============================================================================
 * ADMIN COUPONS MANAGEMENT VIEW
 * ==============================================================================
 * Marketplace voucher campaigns, coupon code generation, usage thresholds,
 * integer minor unit minimums, and status toggles.
 */

import React, { useState } from 'react';
import { useAdmin } from '../context/admin-context';
import type { CouponDiscountType } from '@/domains/admin';
import { formatMinorToCurrency } from '@/domains/admin/utils/analytics';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { TicketPercent, Plus, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export function AdminCouponsView(): React.JSX.Element {
  const { coupons, createCoupon, toggleCouponActive, hasPermission } = useAdmin();

  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchaseMajor, setMinPurchaseMajor] = useState<number>(50);
  const [maxUsage, setMaxUsage] = useState<number>(500);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canWrite = hasPermission('promotions:write');

  const handleCreateCoupon = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!code.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const minPurchaseMinor = Math.round(minPurchaseMajor * 100);
      const calculatedDiscountValue =
        discountType === 'percentage'
          ? Number(discountValue)
          : Math.round(Number(discountValue) * 100); // convert $ to minor units

      await createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: calculatedDiscountValue,
        currency: 'USD',
        minPurchaseMinor,
        maxUsageCount: Number(maxUsage),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        description: description.trim(),
      });

      setShowModal(false);
      setCode('');
      setDescription('');
      setDiscountValue(10);
      setMinPurchaseMajor(50);
      setMaxUsage(500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Discount Coupons</h2>
          <p className="text-xs text-muted-foreground">
            Generate and monitor promotional voucher codes across customer checkouts.
          </p>
        </div>

        {canWrite && (
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Coupon
          </Button>
        )}
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Coupon Code</th>
                <th className="px-4 py-3">Discount Value</th>
                <th className="px-4 py-3">Min. Purchase</th>
                <th className="px-4 py-3">Redemption Usage</th>
                <th className="px-4 py-3">Active Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => {
                const discountFormatted =
                  coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% OFF`
                    : `${formatMinorToCurrency(coupon.discountValue, coupon.currency || 'USD')} OFF`;

                return (
                  <tr key={coupon.id} className="transition hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                        <TicketPercent className="h-3.5 w-3.5 text-primary" />
                        <span>{coupon.code}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{coupon.description}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{discountFormatted}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {formatMinorToCurrency(coupon.minPurchaseMinor, 'USD')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-foreground">
                        {coupon.currentUsageCount} / {coupon.maxUsageCount}
                      </div>
                      <div className="w-24 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((coupon.currentUsageCount / coupon.maxUsageCount) * 100))}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[11px]">
                      {new Date(coupon.startDate).toLocaleDateString()} –{' '}
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canWrite && (
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => toggleCouponActive(coupon.id)}
                        >
                          {coupon.isActive ? (
                            <>
                              <ToggleRight className="mr-1 h-4 w-4 text-emerald-600" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="mr-1 h-4 w-4 text-muted-foreground" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Provision Promotional Coupon</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Define voucher code, discount rate, and minimum checkout conditions.
            </p>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-medium text-foreground">Coupon Code (Uppercase)</label>
                <Input
                  required
                  placeholder="e.g. SUMMER2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-medium text-foreground">Description</label>
                <Input
                  required
                  placeholder="e.g. 15% off orders over $75"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as CouponDiscountType)}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-foreground"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-foreground">
                    Value {discountType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground">Min Purchase ($)</label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={minPurchaseMajor}
                    onChange={(e) => setMinPurchaseMajor(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground">Max Redemptions</label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  Create Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
