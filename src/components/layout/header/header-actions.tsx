import * as React from 'react';
import { User, Heart, ShoppingBag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeaderActionProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  compact?: boolean;
}

export interface AccountActionProps extends HeaderActionProps {
  userName?: string;
  subtitle?: string;
}

/**
 * Account Navigation Entry — Aureon Luxury Theme.
 */
export function AccountAction({
  userName,
  subtitle = 'Account & Lists',
  compact = false,
  className,
  ...props
}: AccountActionProps): React.JSX.Element {
  return (
    <a
      href="/account"
      aria-label={userName ? `Account for ${userName}` : 'Your Account and Orders'}
      className={cn(
        'group flex items-center gap-2.5 rounded-full p-1.5 text-white hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        className
      )}
      {...props}
    >
      <div className="flex size-9 items-center justify-center rounded-full bg-[#18181B] border border-[#27272A] group-hover:border-amber-400/60 transition-colors shrink-0">
        <User className="size-4.5 text-white group-hover:text-amber-400" />
      </div>
      {!compact && (
        <div className="hidden xl:flex flex-col text-left leading-tight select-none">
          <span className="text-[10px] text-[#A1A1AA] font-normal truncate max-w-28">
            {userName ? `Hi, ${userName}` : 'Sign In'}
          </span>
          <span className="text-xs font-bold text-white group-hover:text-amber-400">
            {subtitle}
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
 * Wishlist Navigation Entry — Aureon Luxury Theme.
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
        'group relative flex items-center gap-2 rounded-full p-1.5 text-white hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        className
      )}
      {...props}
    >
      <div className="relative flex size-9 items-center justify-center rounded-full bg-[#18181B] border border-[#27272A] group-hover:border-amber-400/60 transition-colors shrink-0">
        <Heart className="size-4.5 text-white group-hover:text-amber-400" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white tabular-nums">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
      {!compact && (
        <div className="hidden xl:flex flex-col text-left leading-tight select-none">
          <span className="text-[10px] text-[#A1A1AA] font-normal">Favorites</span>
          <span className="text-xs font-bold text-white group-hover:text-amber-400">
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
 * Cart Navigation Entry — Aureon Luxury Theme.
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
        'group relative flex items-center gap-2.5 rounded-full p-1.5 text-white hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        className
      )}
      {...props}
    >
      <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold transition-transform group-hover:scale-105 shrink-0 shadow-md shadow-amber-500/20">
        <ShoppingBag className="size-4.5 text-slate-950" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-[#0B0B0C] tabular-nums">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>

      {!compact && (
        <div className="hidden sm:flex flex-col text-left leading-tight select-none">
          <span className="text-[10px] text-[#A1A1AA] font-normal">Cart</span>
          <span className="text-xs font-black text-white group-hover:text-amber-400 tabular-nums">
            {subtotal || (itemCount > 0 ? `${itemCount} items` : '$0.00')}
          </span>
        </div>
      )}
    </a>
  );
}

/**
 * Seller Hub Navigation Entry — Aureon Luxury Theme.
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
        'inline-flex items-center gap-1.5 rounded-full border border-[#27272A] bg-[#18181B] px-3.5 py-1.5 text-xs font-bold text-[#D1D5DB] hover:border-amber-400/60 hover:text-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        className
      )}
      {...props}
    >
      <Store className="size-3.5 text-amber-400" />
      {!compact && <span>Seller Central</span>}
    </a>
  );
}
