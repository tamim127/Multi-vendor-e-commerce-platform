/**
 * ==============================================================================
 * CATALOG DOMAIN — CATEGORY TREE UTILITIES
 * ==============================================================================
 * Traversal, hierarchy building, and breadcrumb lineage resolution supporting
 * arbitrary category depth (>3 levels).
 */

import type { Category, CategoryBreadcrumb, CategoryTreeNode } from '../types/category';

/**
 * Builds a hierarchical CategoryTreeNode[] tree from a flat list of categories.
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // Initialize node clones with empty children
  for (const cat of categories) {
    categoryMap.set(cat.id, { ...cat, children: [] });
  }

  // Wire up parent-child relationships
  for (const cat of categories) {
    const node = categoryMap.get(cat.id)!;
    if (cat.parentId === null) {
      roots.push(node);
    } else {
      const parentNode = categoryMap.get(cat.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // Orphaned node treated as root to preserve data visibility
        roots.push(node);
      }
    }
  }

  // Sort nodes at each level by level and slug
  const sortNodes = (nodes: CategoryTreeNode[]): void => {
    nodes.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const node of nodes) {
      sortNodes(node.children);
    }
  };

  sortNodes(roots);
  return roots;
}

/**
 * Finds all ancestors of a category ordered from root down to parent.
 */
export function getCategoryAncestors(categoryId: string, categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const ancestors: Category[] = [];
  let current = categoryMap.get(categoryId);

  while (current && current.parentId !== null) {
    const parent = categoryMap.get(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}

/**
 * Generates breadcrumb lineage for a given category including itself.
 */
export function getCategoryBreadcrumbs(
  categoryId: string,
  categories: Category[]
): CategoryBreadcrumb[] {
  const currentCategory = categories.find((c) => c.id === categoryId);
  if (!currentCategory) return [];

  const ancestors = getCategoryAncestors(categoryId, categories);
  const chain = [...ancestors, currentCategory];

  return chain.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    level: cat.level,
    path: cat.path,
  }));
}

/**
 * Recursively retrieves all descendant categories of a given parent category ID.
 */
export function getCategoryDescendants(parentId: string, categories: Category[]): Category[] {
  const children = categories.filter((c) => c.parentId === parentId);
  const descendants: Category[] = [...children];

  for (const child of children) {
    descendants.push(...getCategoryDescendants(child.id, categories));
  }

  return descendants;
}
