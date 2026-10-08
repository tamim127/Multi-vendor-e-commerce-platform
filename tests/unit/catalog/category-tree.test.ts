/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — CATEGORY TREE HIERARCHY
 * ==============================================================================
 * Tests category tree generation, unlimited depth (>3 levels), and breadcrumbs.
 */

import { describe, expect, it } from 'vitest';
import { MOCK_CATEGORIES } from '@/domains/catalog/fixtures';
import {
  buildCategoryTree,
  getCategoryAncestors,
  getCategoryBreadcrumbs,
  getCategoryDescendants,
} from '@/domains/catalog/utils';

describe('Category Tree & Unlimited Depth Hierarchy', () => {
  it('supports category hierarchy exceeding 3 levels (Level 0 through Level 4)', () => {
    const level4Category = MOCK_CATEGORIES.find((c) => c.level === 4);
    expect(level4Category).toBeDefined();
    expect(level4Category?.slug).toBe('workstation-ultrabooks');
    expect(level4Category?.parentId).toBe('cat-ultraportable-laptops');
  });

  it('builds a nested tree structure from flat category list', () => {
    const tree = buildCategoryTree(MOCK_CATEGORIES);
    expect(tree.length).toBeGreaterThan(0);

    const electronicsRoot = tree.find((node) => node.slug === 'electronics');
    expect(electronicsRoot).toBeDefined();
    expect(electronicsRoot?.children.length).toBeGreaterThan(0);

    const computersNode = electronicsRoot?.children.find((c) => c.slug === 'computers-laptops');
    expect(computersNode).toBeDefined();

    const laptopsNode = computersNode?.children.find((c) => c.slug === 'laptops');
    expect(laptopsNode).toBeDefined();

    const ultraportableNode = laptopsNode?.children.find((c) => c.slug === 'ultraportable-laptops');
    expect(ultraportableNode).toBeDefined();

    const workstationNode = ultraportableNode?.children.find(
      (c) => c.slug === 'workstation-ultrabooks'
    );
    expect(workstationNode).toBeDefined();
    expect(workstationNode?.level).toBe(4);
  });

  it('correctly resolves all ancestors in order from root down to parent', () => {
    const ancestors = getCategoryAncestors('cat-workstation-ultrabooks', MOCK_CATEGORIES);
    expect(ancestors.map((a) => a.slug)).toEqual([
      'electronics',
      'computers-laptops',
      'laptops',
      'ultraportable-laptops',
    ]);
  });

  it('generates accurate breadcrumbs including target category', () => {
    const breadcrumbs = getCategoryBreadcrumbs('cat-workstation-ultrabooks', MOCK_CATEGORIES);
    expect(breadcrumbs.length).toBe(5);
    expect(breadcrumbs[0]?.slug).toBe('electronics');
    expect(breadcrumbs[0]?.level).toBe(0);
    expect(breadcrumbs[4]?.slug).toBe('workstation-ultrabooks');
    expect(breadcrumbs[4]?.level).toBe(4);
  });

  it('retrieves all recursive descendants of a root category', () => {
    const descendants = getCategoryDescendants('cat-electronics', MOCK_CATEGORIES);
    expect(descendants.length).toBeGreaterThan(5);
    const slugs = descendants.map((d) => d.slug);
    expect(slugs).toContain('computers-laptops');
    expect(slugs).toContain('laptops');
    expect(slugs).toContain('workstation-ultrabooks');
  });
});
