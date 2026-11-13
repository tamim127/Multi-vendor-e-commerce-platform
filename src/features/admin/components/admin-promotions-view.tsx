'use client';

/**
 * ==============================================================================
 * ADMIN PROMOTIONS MANAGEMENT VIEW
 * ==============================================================================
 * Storewide banner marketing campaigns, seasonal event discounts, and active schedules.
 * Fully supports White (Light) and Dark Aureon themes.
 */

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/admin-context';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Plus, CheckCircle2, XCircle, Calendar, Sparkles, Tag, Flame, Megaphone } from 'lucide-react';

export function AdminPromotionsView(): React.JSX.Element {
  const { promotions, createPromotion, hasPermission } = useAdmin();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('Hot Deal');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [submitting, setSubmitting] = useState(false);

  const canWrite = hasPermission('promotions:write');

  const activeCount = useMemo(() => promotions.filter((p) => p.isActive).length, [promotions]);
  const maxDiscount = useMemo(
    () => (promotions.length ? Math.max(...promotions.map((p) => p.discountPercent)) : 0),
    [promotions]
  );

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
      {/* Campaign Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Active Campaigns
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {activeCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Of {promotions.length} total scheduled
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Max Discount
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {maxDiscount}% OFF
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Peak promotional tier
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Promotions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {promotions.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Catalog-wide events
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Audience Reach
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            100%
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Storewide banners active
          </div>
        </div>
      </div>

      {/* Header Toolbar */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Marketing Promotions & Events</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manage site-wide promotional banners, merchandising events, and campaign sales.
          </p>
        </div>

        {canWrite && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20"
          >
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
            className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {promo.badgeText} ({promo.discountPercent}% OFF)
                </span>
                {promo.isActive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                    <XCircle className="h-3.5 w-3.5" /> Inactive
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{promo.name}</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {promo.description}
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 dark:border-[#1E1E24] pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span>
                  {new Date(promo.startDate).toLocaleDateString()} –{' '}
                  {new Date(promo.endDate).toLocaleDateString()}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">{promo.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Launch Promotional Campaign</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Configure campaign title, discount rate, and merchandising badge.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-900 dark:text-white">Campaign Name</label>
                <Input
                  required
                  placeholder="e.g. Summer Hardware Gala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 rounded-xl bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-900 dark:text-white">Description</label>
                <Input
                  required
                  placeholder="e.g. Up to 20% off all gaming accessories"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 rounded-xl bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-900 dark:text-white">Badge Label</label>
                  <Input
                    required
                    placeholder="e.g. Special Deal"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="mt-1 rounded-xl bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-900 dark:text-white">Discount Rate (%)</label>
                  <Input
                    type="number"
                    required
                    min={1}
                    max={90}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="mt-1 font-mono rounded-xl bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl text-slate-700 dark:text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold"
                >
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
