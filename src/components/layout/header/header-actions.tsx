import * as React from 'react';
import { User, Heart, ShoppingBag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderActionProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  compact?: boolean;
}

/**
 * Account Navigation Entry.
 */
export function AccountAction({
  compact = false,
  className,
  ...props
}: HeaderActionProps): React.JSX.Element {
  return (
    <a
      href="/account"
      aria-label="Your Account and Orders"
      className={cn(
        'group flex items-center gap-2.5 rounded-md p-1.5 text-fg-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      {...props}
    >
      <div className="flex size-9 items-center justify-center rounded-full bg-surface-muted group-hover:bg-primary/10 transition-colors shrink-0">
        <User className="size-4.5" />
      </div>
      {!compact && (
        <div className="hidden xl:flex flex-col text-left leading-tight select-none">
          <span className="text-2xs text-fg-muted font-normal">Sign In</span>
          <span className="text-xs font-semibold text-fg-primary group-hover:text-primary">
            Account &amp; Lists
          </span>
        </div>
      )}
    </a>
  );
}

export interface WishlistActionProps extends HeaderActionProps {
  count?: number;
}

/**
 * Wishlist Navigation Entry.
 */
export function WishlistAction({
  count = 0,
  compact = false,
  className,
  ...props
}: WishlistActionProps): React.JSX.Element {
  return (
    <a
      href="/wishlist"
      aria-label={`Wishlist, ${count} saved items`}
      className={cn(
        'group relative flex items-center gap-2 rounded-md p-1.5 text-fg-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      {...props}
    >
      <div className="relative flex size-9 items-center justify-center rounded-full bg-surface-muted group-hover:bg-primary/10 transition-colors shrink-0">
        <Heart className="size-4.5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground tabular-nums">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
      {!compact && (
        <div className="hidden xl:flex flex-col text-left leading-tight select-none">
          <span className="text-2xs text-fg-muted font-normal">Favorites</span>
          <span className="text-xs font-semibold text-fg-primary group-hover:text-primary">
            Wishlist
          </span>
        </div>
      )}
    </a>
  );
}

export interface CartActionProps extends HeaderActionProps {
  itemCount?: number;
  subtotal?: string;
}

/**
 * Cart Navigation Entry.
 */
export function CartAction({
  itemCount = 0,
  subtotal,
  compact = false,
  className,
  ...props
}: CartActionProps): React.JSX.Element {
  return (
    <a
      href="/cart"
      aria-label={`Shopping cart, ${itemCount} items${subtotal ? `, total ${subtotal}` : ''}`}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md p-1.5 text-fg-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      {...props}
    >
      <div className="relative flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105 shrink-0 shadow-xs">
        <ShoppingBag className="size-4.5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-canvas tabular-nums">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>

      {!compact && (
        <div className="hidden sm:flex flex-col text-left leading-tight select-none">
          <span className="text-2xs text-fg-muted font-normal">Cart</span>
          <span className="text-xs font-bold text-fg-primary group-hover:text-primary tabular-nums">
            {subtotal || (itemCount > 0 ? `${itemCount} items` : '$0.00')}
          </span>
        </div>
      )}
    </a>
  );
}

/**
 * Seller Hub Navigation Entry.
 */
export function SellerAction({
  compact = false,
  className,
  ...props
}: HeaderActionProps): React.JSX.Element {
  return (
    <a
      href="/seller/hub"
      aria-label="Merchant and Seller Portal"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface px-3 py-1 text-xs font-semibold text-fg-secondary hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      {...props}
    >
      <Store className="size-3.5" />
      {!compact && <span>Seller Central</span>}
    </a>
  );
}
