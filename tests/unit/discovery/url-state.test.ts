/**
 * ==============================================================================
 * CATALOG DISCOVERY TEST SUITE — URL STATE HOOK
 * ==============================================================================
 * Tests useCatalogUrlState canonical URL synchronization, parameter updates,
 * pagination resets, and filter clearing.
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCatalogUrlState } from '@/features/catalog-discovery/hooks/use-catalog-url-state';

const mockPush = vi.fn();
let currentSearchString = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  usePathname: () => '/products',
  useSearchParams: () => new URLSearchParams(currentSearchString),
}));

describe('useCatalogUrlState Hook', () => {
  beforeEach(() => {
    mockPush.mockClear();
    currentSearchString = '';
  });

  it('parses initial URL query parameters', () => {
    currentSearchString = 'category=laptops&brands=apple,sony&sort=price_asc';

    const { result } = renderHook(() => useCatalogUrlState());

    expect(result.current.params.categorySlug).toBe('laptops');
    expect(result.current.params.brandSlugs).toEqual(['apple', 'sony']);
    expect(result.current.params.sort).toBe('price_asc');
  });

  it('pushes updated URL and resets page on setParam', () => {
    currentSearchString = 'category=laptops&page=3';

    const { result } = renderHook(() => useCatalogUrlState());

    act(() => {
      result.current.setParam('brandSlugs', ['apple']);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    const pushedUrl = mockPush.mock.calls[0]![0] as string;
    expect(pushedUrl).toContain('/products?');
    expect(pushedUrl).toContain('category=laptops');
    expect(pushedUrl).toContain('brands=apple');
    // Page must be reset
    expect(pushedUrl).not.toContain('page=');
  });

  it('updates page without clearing existing filters on setPage', () => {
    currentSearchString = 'category=laptops&brands=apple';

    const { result } = renderHook(() => useCatalogUrlState());

    act(() => {
      result.current.setPage(2);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    const pushedUrl = mockPush.mock.calls[0]![0] as string;
    expect(pushedUrl).toContain('category=laptops');
    expect(pushedUrl).toContain('brands=apple');
    expect(pushedUrl).toContain('page=2');
  });

  it('clears all parameters on resetFilters', () => {
    currentSearchString = 'category=laptops&brands=apple&minPrice=50000';

    const { result } = renderHook(() => useCatalogUrlState());

    act(() => {
      result.current.resetFilters();
    });

    expect(mockPush).toHaveBeenCalledWith('/products', { scroll: false });
  });

  it('preserves search query q on resetFilters when q is present', () => {
    currentSearchString = 'q=macbook&brands=apple&minPrice=50000';

    const { result } = renderHook(() => useCatalogUrlState());

    act(() => {
      result.current.resetFilters();
    });

    expect(mockPush).toHaveBeenCalledWith('/products?q=macbook', { scroll: false });
  });

  it('updates search query and resets page on setQuery', () => {
    currentSearchString = 'category=laptops&page=2';

    const { result } = renderHook(() => useCatalogUrlState());

    act(() => {
      result.current.setQuery('thinkpad');
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    const pushedUrl = mockPush.mock.calls[0]![0] as string;
    expect(pushedUrl).toContain('q=thinkpad');
    expect(pushedUrl).not.toContain('page=');
  });

  it('computes effectiveSort correctly according to query presence and explicit selection', () => {
    // 1. Neither q nor sort -> 'newest'
    currentSearchString = 'category=laptops';
    const { result: res1 } = renderHook(() => useCatalogUrlState());
    expect(res1.current.effectiveSort).toBe('newest');

    // 2. q present, sort omitted -> 'relevance'
    currentSearchString = 'q=laptop&category=laptops';
    const { result: res2 } = renderHook(() => useCatalogUrlState());
    expect(res2.current.effectiveSort).toBe('relevance');

    // 3. q present, sort explicitly 'newest' -> 'newest'
    currentSearchString = 'q=laptop&sort=newest';
    const { result: res3 } = renderHook(() => useCatalogUrlState());
    expect(res3.current.effectiveSort).toBe('newest');

    // 4. q present, sort explicitly 'price_asc' -> 'price_asc'
    currentSearchString = 'q=laptop&sort=price_asc';
    const { result: res4 } = renderHook(() => useCatalogUrlState());
    expect(res4.current.effectiveSort).toBe('price_asc');
  });
});
