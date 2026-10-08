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
});
