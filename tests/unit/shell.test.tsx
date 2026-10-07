import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AppShell,
  Container,
  Section,
  SkipToContent,
  AnnouncementBar,
  SearchBar,
  AccountAction,
  WishlistAction,
  CartAction,
  SellerAction,
  MegaMenu,
  DesktopHeader,
  MobileHeader,
  MobileBottomNav,
  SiteFooter,
} from '@/components/layout';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';

// Mock Next.js navigation hook
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Phase 1E: Responsive Application Shell & Navigation Engine', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });
  describe('Layout Primitives', () => {
    it('renders Container with standard max-width', () => {
      const { container } = render(<Container size="standard">Content</Container>);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('max-w-7xl');
      expect(el.textContent).toBe('Content');
    });

    it('renders Section with responsive vertical spacing', () => {
      const { container } = render(<Section spacing="lg">Section content</Section>);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('py-12');
      expect(el.tagName.toLowerCase()).toBe('section');
    });

    it('renders SkipToContent link with #main-content target', () => {
      render(<SkipToContent />);
      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toBeDefined();
      expect(skipLink.getAttribute('href')).toBe('#main-content');
      expect(skipLink.className).toContain('sr-only');
    });
  });

  describe('AnnouncementBar Component', () => {
    it('renders promotional message and optional action link', () => {
      render(
        <AnnouncementBar
          message="Special Spring Trade Event"
          badge="Promotion"
          actionText="View Deals"
          actionHref="/deals"
        />
      );
      expect(screen.getByText('Special Spring Trade Event')).toBeDefined();
      expect(screen.getByText('Promotion')).toBeDefined();
      expect(screen.getByRole('link', { name: /view deals/i })).toBeDefined();
    });

    it('dismisses announcement when close button is clicked', () => {
      const handleDismiss = vi.fn();
      render(<AnnouncementBar onDismiss={handleDismiss} />);
      const dismissBtn = screen.getByRole('button', { name: /dismiss announcement/i });
      fireEvent.click(dismissBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('complementary')).toBeNull();
    });
  });

  describe('SearchBar Component', () => {
    it('renders search input with accessible search role', () => {
      render(<SearchBar placeholder="Find items..." />);
      const form = screen.getByRole('search');
      expect(form).toBeDefined();
      const input = screen.getByPlaceholderText('Find items...');
      expect(input).toBeDefined();
    });

    it('handles query typing and clearing', () => {
      const handleChange = vi.fn();
      render(<SearchBar onQueryChange={handleChange} />);
      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'Mechanical keyboard' } });
      expect(handleChange).toHaveBeenCalledWith('Mechanical keyboard');

      const clearBtn = screen.getByRole('button', { name: /clear search input/i });
      fireEvent.click(clearBtn);
      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('submits search query on form submission', () => {
      const handleSubmit = vi.fn();
      render(<SearchBar initialQuery="Laptops" onSearchSubmit={handleSubmit} />);
      const submitBtn = screen.getByRole('button', { name: /perform search/i });
      fireEvent.click(submitBtn);
      expect(handleSubmit).toHaveBeenCalledWith('Laptops');
    });
  });

  describe('Header Action Entries', () => {
    it('renders AccountAction with accessible label', () => {
      render(<AccountAction />);
      const link = screen.getByRole('link', { name: /your account and orders/i });
      expect(link).toBeDefined();
      expect(link.getAttribute('href')).toBe('/account');
    });

    it('renders WishlistAction with count badge', () => {
      render(<WishlistAction count={5} />);
      const link = screen.getByRole('link', { name: /wishlist, 5 saved items/i });
      expect(link).toBeDefined();
      expect(screen.getByText('5')).toBeDefined();
    });

    it('renders CartAction with item count and subtotal', () => {
      render(<CartAction itemCount={3} subtotal="$149.99" />);
      const link = screen.getByRole('link', { name: /shopping cart, 3 items/i });
      expect(link).toBeDefined();
      expect(screen.getByText('$149.99')).toBeDefined();
    });

    it('renders SellerAction portal link', () => {
      render(<SellerAction />);
      const link = screen.getByRole('link', { name: /merchant and seller portal/i });
      expect(link).toBeDefined();
      expect(screen.getByText('Seller Central')).toBeDefined();
    });
  });

  describe('MegaMenu Component', () => {
    it('renders category trigger button and toggles flyout', () => {
      render(<MegaMenu />);
      const trigger = screen.getByRole('button', { name: /toggle all categories catalogue/i });
      expect(trigger.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByRole('region', { name: /catalogue categories/i })).toBeDefined();
    });

    it('closes mega menu when Escape key is pressed', () => {
      render(<MegaMenu />);
      const trigger = screen.getByRole('button', { name: /toggle all categories catalogue/i });
      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      fireEvent.keyDown(trigger, { key: 'Escape' });
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('DesktopHeader & MobileHeader Components', () => {
    it('renders DesktopHeader with branding and utility links', () => {
      render(
        <ThemeProvider>
          <I18nProvider>
            <DesktopHeader />
          </I18nProvider>
        </ThemeProvider>
      );
      expect(screen.getByText(/global multi-vendor trade platform/i)).toBeDefined();
      expect(screen.getByText('MARKETPLACE')).toBeDefined();
    });

    it('renders MobileHeader with drawer trigger and brand', () => {
      render(
        <ThemeProvider>
          <I18nProvider>
            <MobileHeader />
          </I18nProvider>
        </ThemeProvider>
      );
      expect(screen.getByRole('button', { name: /open mobile navigation menu/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /open mobile search/i })).toBeDefined();
    });
  });

  describe('MobileBottomNav Component', () => {
    it('renders mobile bottom bar with navigation items and safe-area styling', () => {
      const { container } = render(<MobileBottomNav />);
      const nav = container.querySelector('nav');
      expect(nav).toBeDefined();
      expect(screen.getByRole('link', { name: /home/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /categories/i })).toBeDefined();
      expect(screen.getByRole('link', { name: /cart/i })).toBeDefined();
    });
  });

  describe('SiteFooter Component', () => {
    it('renders trust badges and multi-column footer sections', () => {
      render(
        <I18nProvider>
          <SiteFooter />
        </I18nProvider>
      );
      expect(screen.getByRole('contentinfo')).toBeDefined();
      expect(screen.getByText('Cross-Border Delivery')).toBeDefined();
      expect(screen.getByText('Customer Experience')).toBeDefined();
      expect(screen.getByText('Marketplace Ecosystem')).toBeDefined();
    });

    it('handles newsletter form interaction', () => {
      render(
        <I18nProvider>
          <SiteFooter />
        </I18nProvider>
      );
      const input = screen.getByRole('textbox', { name: /corporate email address/i });
      fireEvent.change(input, { target: { value: 'buyer@enterprise.com' } });
      const joinBtn = screen.getByRole('button', { name: /join/i });
      fireEvent.click(joinBtn);
      expect(screen.getByText(/thank you\. you have been added/i)).toBeDefined();
    });
  });

  describe('AppShell Master Component', () => {
    it('renders full shell structure around children', () => {
      render(
        <ThemeProvider>
          <I18nProvider>
            <AppShell announcementMessage="Global launch notice">
              <div data-testid="page-child">Test Page Content</div>
            </AppShell>
          </I18nProvider>
        </ThemeProvider>
      );

      // Verify Skip Link
      expect(screen.getByRole('link', { name: /skip to main content/i })).toBeDefined();

      // Verify Announcement
      expect(screen.getByText('Global launch notice')).toBeDefined();

      // Verify Header
      expect(screen.getByRole('banner')).toBeDefined();

      // Verify Main Landmark
      const main = screen.getByRole('main');
      expect(main.id).toBe('main-content');
      expect(screen.getByTestId('page-child')).toBeDefined();

      // Verify Footer
      expect(screen.getByRole('contentinfo')).toBeDefined();
    });
  });
});
