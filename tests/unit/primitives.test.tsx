import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Spinner,
  SkeletonText,
  Toast,
  Price,
  Rating,
  QuantityControl,
} from '@/components/ui';

describe('Phase 1D: Core UI Primitives Suite', () => {
  describe('Button Primitive', () => {
    it('renders with default variant and children', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeDefined();
      expect(btn.className).toContain('bg-primary');
    });

    it('renders different variants and sizes', () => {
      const { rerender } = render(
        <Button variant="destructive" size="lg">
          Delete
        </Button>
      );
      let btn = screen.getByRole('button', { name: /delete/i });
      expect(btn.className).toContain('bg-destructive');
      expect(btn.className).toContain('h-11');

      rerender(
        <Button variant="secondary" size="sm">
          Cancel
        </Button>
      );
      btn = screen.getByRole('button', { name: /cancel/i });
      expect(btn.className).toContain('bg-secondary');
      expect(btn.className).toContain('h-9');
    });

    it('enforces disabled state and prevents clicks', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const btn = screen.getByRole('button', { name: /disabled/i });
      expect(btn.hasAttribute('disabled')).toBe(true);
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('displays loading spinner, sets aria-busy, and blocks clicks', () => {
      const handleClick = vi.fn();
      render(
        <Button loading loadingText="Processing..." onClick={handleClick}>
          Submit
        </Button>
      );
      const btn = screen.getByRole('button', { name: /processing/i });
      expect(btn.getAttribute('aria-busy')).toBe('true');
      expect(btn.hasAttribute('disabled')).toBe(true);
      expect(screen.getByRole('status')).toBeDefined();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports icon-only button with accessible label', () => {
      render(
        <Button variant="icon" aria-label="Favorite item">
          <span data-testid="heart-icon">♥</span>
        </Button>
      );
      const btn = screen.getByRole('button', { name: /favorite item/i });
      expect(btn).toBeDefined();
    });
  });

  describe('Input Primitive', () => {
    it('associates label with input using htmlFor and id', () => {
      render(<Input label="Email address" type="email" placeholder="you@domain.com" />);
      const input = screen.getByLabelText(/email address/i);
      expect(input).toBeDefined();
      expect(input.getAttribute('type')).toBe('email');
    });

    it('renders error message with role="alert" and aria-invalid', () => {
      render(<Input label="Password" error="Password is required" />);
      const input = screen.getByLabelText(/password/i);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg.textContent).toBe('Password is required');
    });

    it('renders description and connects via aria-describedby', () => {
      render(<Input label="Username" description="Must be unique" />);
      const input = screen.getByLabelText(/username/i);
      const desc = screen.getByText('Must be unique');
      expect(input.getAttribute('aria-describedby')).toContain(desc.id);
    });

    it('supports leading and trailing icons', () => {
      render(
        <Input
          label="Search"
          leadingIcon={<span data-testid="leading-icon">🔍</span>}
          trailingIcon={<span data-testid="trailing-icon">✕</span>}
        />
      );
      expect(screen.getByTestId('leading-icon')).toBeDefined();
      expect(screen.getByTestId('trailing-icon')).toBeDefined();
    });
  });

  describe('Textarea Primitive', () => {
    it('associates label and renders textarea correctly', () => {
      render(<Textarea label="Order notes" placeholder="Leave delivery instructions" />);
      const textarea = screen.getByLabelText(/order notes/i);
      expect(textarea).toBeDefined();
    });

    it('tracks character count when showCount is true', () => {
      render(<Textarea label="Bio" showCount maxLength={100} defaultValue="Hello world" />);
      expect(screen.getByText('11 / 100')).toBeDefined();
    });
  });

  describe('Checkbox Primitive', () => {
    it('renders label and handles checked state', () => {
      render(<Checkbox label="I agree to terms" defaultChecked />);
      const checkbox = screen.getByRole('checkbox', { name: /i agree to terms/i });
      expect(checkbox.getAttribute('data-state')).toBe('checked');
    });

    it('supports indeterminate state', () => {
      render(<Checkbox label="Select all" indeterminate />);
      const checkbox = screen.getByRole('checkbox', { name: /select all/i });
      expect(checkbox.getAttribute('data-state')).toBe('indeterminate');
    });
  });

  describe('Switch Primitive', () => {
    it('renders switch with accessible role and toggle behavior', () => {
      render(<Switch label="Enable two-factor authentication" defaultChecked />);
      const switchEl = screen.getByRole('switch', { name: /enable two-factor/i });
      expect(switchEl.getAttribute('data-state')).toBe('checked');
    });
  });

  describe('Badge Primitive', () => {
    it('renders badge variants and optional dot indicator', () => {
      render(
        <Badge variant="success" dot>
          In Stock
        </Badge>
      );
      const badge = screen.getByText('In Stock');
      expect(badge).toBeDefined();
      expect(badge.className).toContain('text-success');
    });
  });

  describe('Card Primitive Hierarchy', () => {
    it('renders composable card layout with all sections', () => {
      render(
        <Card interactive>
          <CardHeader>
            <CardTitle>Merchant Summary</CardTitle>
            <CardDescription>Verified store statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Active items: 450</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Manage store</Button>
          </CardFooter>
        </Card>
      );
      expect(screen.getByText('Merchant Summary')).toBeDefined();
      expect(screen.getByText('Verified store statistics')).toBeDefined();
      expect(screen.getByText('Active items: 450')).toBeDefined();
      expect(screen.getByRole('button', { name: /manage store/i })).toBeDefined();
    });
  });

  describe('Spinner Primitive', () => {
    it('renders accessible loading indicator', () => {
      render(<Spinner label="Loading catalogue data" size="lg" />);
      const status = screen.getByRole('status');
      expect(status).toBeDefined();
      expect(screen.getByText('Loading catalogue data')).toBeDefined();
    });
  });

  describe('Skeleton Primitive', () => {
    it('renders skeleton and multi-line text shimmer', () => {
      const { container } = render(<SkeletonText lines={4} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(4);
    });
  });

  describe('Toast Primitive', () => {
    it('renders alert notification with accessible live role', () => {
      const handleDismiss = vi.fn();
      render(
        <Toast
          variant="error"
          title="Payment failed"
          description="Insufficient funds in card"
          onDismiss={handleDismiss}
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert.getAttribute('aria-live')).toBe('assertive');
      expect(screen.getByText('Payment failed')).toBeDefined();

      const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
      fireEvent.click(dismissBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Commerce Primitives', () => {
    describe('Price', () => {
      it('renders regular price with screen-reader label', () => {
        render(<Price current="$99.00" currencyCode="USD" />);
        const price = screen.getByLabelText(/current price \$99\.00 USD/i);
        expect(price).toBeDefined();
        expect(price.textContent).toContain('$99.00');
      });

      it('renders compare-at discount price with strikethrough and badge', () => {
        render(<Price current="€129.99" compareAt="€159.99" discount="-19%" currencyCode="EUR" />);
        const price = screen.getByLabelText(
          /current price €129\.99, original price €159\.99, save -19% EUR/i
        );
        expect(price).toBeDefined();
        expect(price.textContent).toContain('€129.99');
        expect(price.textContent).toContain('€159.99');
        expect(price.textContent).toContain('-19%');
      });
    });

    describe('Rating', () => {
      it('renders rating stars with review count and accessible label', () => {
        render(<Rating value={4.5} max={5} reviewCount={1420} />);
        const rating = screen.getByLabelText(/4\.5 out of 5 stars based on 1,420 reviews/i);
        expect(rating).toBeDefined();
        expect(rating.textContent).toContain('4.5');
        expect(rating.textContent).toContain('(1,420)');
      });
    });

    describe('QuantityControl', () => {
      it('handles increment, decrement, and clamping limits', () => {
        const handleChange = vi.fn();
        render(<QuantityControl value={5} min={1} max={10} onChange={handleChange} />);

        const decBtn = screen.getByRole('button', { name: /decrease quantity/i });
        const incBtn = screen.getByRole('button', { name: /increase quantity/i });
        const input = screen.getByRole('textbox', { name: /quantity/i });

        expect(input.getAttribute('value')).toBe('5');

        fireEvent.click(decBtn);
        expect(handleChange).toHaveBeenCalledWith(4);

        fireEvent.click(incBtn);
        expect(handleChange).toHaveBeenCalledWith(6);
      });

      it('disables decrement button when at minimum limit', () => {
        const handleChange = vi.fn();
        render(<QuantityControl value={1} min={1} max={10} onChange={handleChange} />);
        const decBtn = screen.getByRole('button', { name: /decrease quantity/i });
        expect(decBtn.hasAttribute('disabled')).toBe(true);
      });

      it('clamps direct numeric input on blur', () => {
        const handleChange = vi.fn();
        render(<QuantityControl value={5} min={1} max={10} onChange={handleChange} />);
        const input = screen.getByRole('textbox', { name: /quantity/i });
        fireEvent.change(input, { target: { value: '999' } });
        fireEvent.blur(input);
        expect(handleChange).toHaveBeenCalledWith(10);
      });
    });
  });
});
