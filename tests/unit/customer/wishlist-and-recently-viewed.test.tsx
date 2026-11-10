/**
 * ==============================================================================
 * CUSTOMER DOMAIN — WISHLIST & RECENTLY VIEWED TESTS
 * ==============================================================================
 */

import * as React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '@/features/wishlist';
import { RecentlyViewedProvider, useRecentlyViewed } from '@/features/recently-viewed';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures/products.fixture';

const mockProductA = MOCK_PRODUCTS[0]!;
const mockProductB = MOCK_PRODUCTS[1]!;

function WishlistTestConsumer(): React.JSX.Element {
  const {
    items,
    itemCount,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  } = useWishlist();

  return (
    <div>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="is-a-wishlisted">{isInWishlist(mockProductA.id) ? 'yes' : 'no'}</span>
      <button data-testid="add-a" onClick={() => addToWishlist(mockProductA)}>
        Add A
      </button>
      <button data-testid="toggle-a" onClick={() => toggleWishlist(mockProductA)}>
        Toggle A
      </button>
      <button data-testid="remove-a" onClick={() => removeFromWishlist(mockProductA.id)}>
        Remove A
      </button>
      <button data-testid="clear" onClick={() => clearWishlist()}>
        Clear
      </button>
      <ul>
        {items.map((i) => (
          <li key={i.productId} data-testid={`item-${i.productId}`}>
            {i.productId}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentlyViewedTestConsumer(): React.JSX.Element {
  const { items, recordView, clearHistory } = useRecentlyViewed();

  return (
    <div>
      <span data-testid="rv-count">{items.length}</span>
      <button data-testid="record-a" onClick={() => recordView(mockProductA)}>
        Record A
      </button>
      <button data-testid="record-b" onClick={() => recordView(mockProductB)}>
        Record B
      </button>
      <button data-testid="rv-clear" onClick={() => clearHistory()}>
        Clear RV
      </button>
      <ul>
        {items.map((i) => (
          <li key={i.productId} data-testid={`rv-item-${i.productId}`}>
            {i.productId}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('Wishlist State Management', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds and toggles wishlist items correctly', () => {
    render(
      <WishlistProvider>
        <WishlistTestConsumer />
      </WishlistProvider>
    );

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('is-a-wishlisted').textContent).toBe('no');

    act(() => {
      screen.getByTestId('add-a').click();
    });

    expect(screen.getByTestId('item-count').textContent).toBe('1');
    expect(screen.getByTestId('is-a-wishlisted').textContent).toBe('yes');

    // Toggle removes when already present
    act(() => {
      screen.getByTestId('toggle-a').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('is-a-wishlisted').textContent).toBe('no');

    // Toggle adds when absent
    act(() => {
      screen.getByTestId('toggle-a').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('1');

    // Clear
    act(() => {
      screen.getByTestId('clear').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });
});

describe('Recently Viewed Tracking', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('records, deduplicates, and maintains most recent order', () => {
    render(
      <RecentlyViewedProvider>
        <RecentlyViewedTestConsumer />
      </RecentlyViewedProvider>
    );

    expect(screen.getByTestId('rv-count').textContent).toBe('0');

    act(() => {
      screen.getByTestId('record-a').click();
    });
    expect(screen.getByTestId('rv-count').textContent).toBe('1');

    act(() => {
      screen.getByTestId('record-b').click();
    });
    expect(screen.getByTestId('rv-count').textContent).toBe('2');

    // Re-recording Product A should deduplicate and keep count at 2
    act(() => {
      screen.getByTestId('record-a').click();
    });
    expect(screen.getByTestId('rv-count').textContent).toBe('2');

    // Clear
    act(() => {
      screen.getByTestId('rv-clear').click();
    });
    expect(screen.getByTestId('rv-count').textContent).toBe('0');
  });
});
