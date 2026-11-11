'use client';

/**
 * ==============================================================================
 * ADMIN CATEGORIES MANAGEMENT VIEW
 * ==============================================================================
 * Category taxonomy tree oversight, active status toggling, and new category provisioning.
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
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories by title, slug or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {canManage && (
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Categories Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Hierarchy Path</th>
                <th className="px-4 py-3">Depth Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const nameEn = typeof cat.name === 'object' ? cat.name.en : String(cat.name);
                  return (
                    <tr key={cat.id} className="transition hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{nameEn}</span>
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {cat.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{cat.path}</td>
                      <td className="px-4 py-3 font-mono text-foreground">L{cat.level}</td>
                      <td className="px-4 py-3">
                        {cat.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <XCircle className="h-3 w-3" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canManage && (
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => toggleCategoryActive(cat.id)}
                          >
                            {cat.isActive ? (
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Add New Catalog Category</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Define taxonomy node and optional hierarchy parent.
            </p>

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-medium text-foreground">Category Name (English)</label>
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
                  className="mt-1"
                />
              </div>

              <div>
                <label className="font-medium text-foreground">Slug</label>
                <Input
                  required
                  placeholder="e.g. smart-wearables"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-foreground">Parent Category (Optional)</label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-foreground"
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
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
