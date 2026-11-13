'use client';

/**
 * ==============================================================================
 * ADMIN CATEGORIES MANAGEMENT VIEW
 * ==============================================================================
 * Category taxonomy tree oversight, active status toggling, and new category provisioning.
 * Fully supports White (Light) and Dark Aureon themes.
 */

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/admin-context';
import type { CategoryAdminInput } from '@/domains/admin';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export function AdminCategoriesView(): React.JSX.Element {
  const { categories, addCategory, toggleCategoryActive, hasPermission } = useAdmin();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newParentId, setNewParentId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = hasPermission('catalog:write');

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const nameEn = typeof cat.name === 'object' ? cat.name.en : String(cat.name);
      return (
        nameEn.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase()) ||
        cat.id.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [categories, search]);

  const activeCount = useMemo(() => categories.filter((c) => c.isActive).length, [categories]);
  const rootCount = useMemo(() => categories.filter((c) => c.level === 0).length, [categories]);
  const maxDepth = useMemo(
    () => (categories.length ? Math.max(...categories.map((c) => c.level)) : 0),
    [categories]
  );

  const handleCreateCategory = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newSlug.trim() || !newNameEn.trim()) return;

    setSubmitting(true);
    try {
      const input: CategoryAdminInput = {
        slug: newSlug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-'),
        name: { en: newNameEn.trim() },
        parentId: newParentId.trim() ? newParentId.trim() : null,
        isActive: true,
      };
      await addCategory(input);
      setShowAddModal(false);
      setNewSlug('');
      setNewNameEn('');
      setNewParentId('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Taxonomy Overview KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Categories
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FolderTree className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {categories.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Across canonical tree
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Active In Store
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Visible to shoppers
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Root Domains
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {rootCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Level-0 taxonomy roots
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Max Depth Level
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            L{maxDepth}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            Hierarchy depth
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <Input
            placeholder="Search categories by title, slug or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white rounded-xl"
          />
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-[#27272A] bg-slate-50/80 dark:bg-[#18181B] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-5 py-3.5">Hierarchy Path</th>
                <th className="px-5 py-3.5">Depth Level</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E24]">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                    No categories found matching your query.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const nameEn = typeof cat.name === 'object' ? cat.name.en : String(cat.name);
                  return (
                    <tr
                      key={cat.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#18181B]/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <FolderTree className="h-3.5 w-3.5" />
                          </div>
                          <span>{nameEn}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 ml-8">
                          {cat.slug}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-zinc-400">
                        {cat.path}
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span className="inline-block rounded-md bg-slate-100 dark:bg-[#1E1E24] px-2 py-0.5 text-slate-700 dark:text-zinc-300 font-semibold">
                          L{cat.level}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {cat.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#1E1E24] dark:text-slate-400 dark:border-[#27272A] px-2.5 py-0.5 text-xs font-bold">
                            <XCircle className="h-3 w-3" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => toggleCategoryActive(cat.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors"
                          >
                            {cat.isActive ? (
                              <>
                                <ToggleRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#121216] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Add New Catalog Category
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Define taxonomy node and optional hierarchy parent.
            </p>

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-900 dark:text-white">
                  Category Name (English)
                </label>
                <Input
                  required
                  placeholder="e.g. Smart Wearables"
                  value={newNameEn}
                  onChange={(e) => {
                    setNewNameEn(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="mt-1 rounded-xl bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-900 dark:text-white">Slug</label>
                <Input
                  required
                  placeholder="e.g. smart-wearables"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="mt-1 font-mono rounded-xl bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-900 dark:text-white">
                  Parent Category (Optional)
                </label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#18181B] p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">None (Root Category - Level 0)</option>
                  {categories.map((c) => {
                    const name = typeof c.name === 'object' ? c.name.en : String(c.name);
                    return (
                      <option key={c.id} value={c.id}>
                        {'—'.repeat(c.level)} {name} ({c.id})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
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
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
