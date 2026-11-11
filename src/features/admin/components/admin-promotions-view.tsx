'use client';

/**
 * ==============================================================================
 * ADMIN PROMOTIONS MANAGEMENT VIEW
 * ==============================================================================
 * Storewide banner marketing campaigns, seasonal event discounts, and active schedules.
 */

import React, { useState } from 'react';
import { useAdmin } from '../context/admin-context';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Plus, CheckCircle2, XCircle, Calendar, Sparkles } from 'lucide-react';

export function AdminPromotionsView(): React.JSX.Element {
  const { promotions, createPromotion, hasPermission } = useAdmin();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('Hot Deal');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [submitting, setSubmitting] = useState(false);

  const canWrite = hasPermission('promotions:write');

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await createPromotion({
        name: name.trim(),
        description: description.trim(),
        badgeText: badgeText.trim(),
        discountPercent: Number(discountPercent),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      });

      setShowModal(false);
      setName('');
      setDescription('');
      setBadgeText('Hot Deal');
      setDiscountPercent(15);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Marketing Promotions</h2>
          <p className="text-xs text-muted-foreground">
            Manage site-wide promotional banners, merchandising events, and campaign sales.
          </p>
        </div>

        {canWrite && (
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Campaign
          </Button>
        )}
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {promo.badgeText} ({promo.discountPercent}% OFF)
                </span>
                {promo.isActive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5" /> Inactive
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-lg font-bold text-foreground">{promo.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {promo.description}
              </p>
            </div>

            <div className="mt-6 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(promo.startDate).toLocaleDateString()} –{' '}
                  {new Date(promo.endDate).toLocaleDateString()}
                </span>
              </div>
              <span className="font-mono text-[11px]">{promo.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Launch Promotional Campaign</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure campaign title, discount rate, and merchandising badge.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-medium text-foreground">Campaign Name</label>
                <Input
                  required
                  placeholder="e.g. Summer Hardware Gala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-foreground">Description</label>
                <Input
                  required
                  placeholder="e.g. Up to 20% off all gaming accessories"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground">Badge Label</label>
                  <Input
                    required
                    placeholder="e.g. Special Deal"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="font-medium text-foreground">Discount Rate (%)</label>
                  <Input
                    type="number"
                    required
                    min={1}
                    max={90}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
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
                  Launch Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
