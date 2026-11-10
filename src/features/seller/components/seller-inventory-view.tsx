'use client';

/**
 * ==============================================================================
 * SELLER INVENTORY MANAGEMENT VIEW
 * ==============================================================================
 * Real-time SKU stock level tracking, warehouse location mapping,
 * low-stock threshold triggers, and inventory adjustment workflows.
 */

import React, { useState } from 'react';
import { useSeller } from '../context/seller-context';
import type { InventoryItem, InventoryAdjustmentInput } from '@/domains/seller/types/inventory';
import { InventoryAdjustmentSchema } from '@/domains/seller/schemas/inventory.schema';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import { Spinner } from '@/components/ui/spinner/spinner';
import { Search, AlertTriangle, CheckCircle2, XCircle, Sliders, X, MapPin } from 'lucide-react';

export function SellerInventoryView(): React.JSX.Element {
  const { inventory, adjustInventory } = useSeller();
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [alertFilter, setAlertFilter] = useState<'all' | 'normal' | 'low_stock' | 'out_of_stock'>(
    'all'
  );
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

  // Modal State
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [reason, setReason] = useState<InventoryAdjustmentInput['reason']>('audit_adjustment');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (alertFilter !== 'all') {
      return item.alertLevel === alertFilter;
    }

    return true;
  });

  const openAdjustmentModal = (item: InventoryItem): void => {
    setAdjustingItem(item);
    setNewQuantity(item.quantityAvailable);
    setReason('audit_adjustment');
    setNotes('');
    setModalError(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!adjustingItem) return;
    setModalError(null);

    const payload = {
      sku: adjustingItem.sku,
      newQuantity,
      reason,
      notes: notes || undefined,
    };

    const result = InventoryAdjustmentSchema.safeParse(payload);
    if (!result.success) {
      setModalError(result.error.issues[0]?.message || 'Invalid adjustment data');
      return;
    }

    setSaving(true);
    try {
      await adjustInventory(result.data);
      setAdjustingItem(null);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to adjust inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by product title or SKU..."
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center rounded-xl border border-input bg-background p-1 text-xs">
          <button
            type="button"
            onClick={() => setAlertFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              alertFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All SKUs ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setAlertFilter('normal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              alertFilter === 'normal'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Healthy
          </button>
          <button
            type="button"
            onClick={() => setAlertFilter('low_stock')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              alertFilter === 'low_stock'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Low Stock
          </button>
          <button
            type="button"
            onClick={() => setAlertFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              alertFilter === 'out_of_stock'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Inventory Matrix Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-6 py-3.5">SKU & Item Details</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Available</th>
                <th className="px-6 py-3.5">Reserved</th>
                <th className="px-6 py-3.5">Alert Level</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No SKU inventory records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">
                          {item.productTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span className="font-mono">{item.sku}</span>
                          {item.variantName && <span>• {item.variantName}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{item.location || 'Fulfillment Hub'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground text-base">
                        {item.quantityAvailable}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {item.quantityReserved} units
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.alertLevel === 'out_of_stock'
                            ? 'bg-rose-500/10 text-rose-600'
                            : item.alertLevel === 'low_stock'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {item.alertLevel === 'out_of_stock' ? (
                          <XCircle className="h-3 w-3" />
                        ) : item.alertLevel === 'low_stock' ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {item.alertLevel.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openAdjustmentModal(item)}
                        className="h-8 text-xs"
                      >
                        <Sliders className="mr-1 h-3 w-3" />
                        {t('seller.updateStock')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Inventory Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Adjust Inventory Stock</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  SKU: {adjustingItem.sku}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              {modalError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {modalError}
                </div>
              )}

              <div>
                <label
                  htmlFor="newQuantity"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  New Available Quantity *
                </label>
                <input
                  id="newQuantity"
                  type="number"
                  min="0"
                  max="100000"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="adjustmentReason"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Adjustment Reason *
                </label>
                <select
                  id="adjustmentReason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as InventoryAdjustmentInput['reason'])}
                  className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="audit_adjustment">Physical Audit / Count Correction</option>
                  <option value="restock">Inbound Supplier Restock</option>
                  <option value="damaged">Damaged / Defective Write-off</option>
                  <option value="manual_override">Manual Operational Adjustment</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="adjustmentNotes"
                  className="block text-xs font-semibold uppercase text-muted-foreground"
                >
                  Internal Audit Notes
                </label>
                <textarea
                  id="adjustmentNotes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reference PO or audit batch number..."
                  className="mt-1 block w-full rounded-xl border border-input bg-background p-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setAdjustingItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={saving}>
                  {saving && <Spinner size="sm" className="mr-2" />}
                  Confirm Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
