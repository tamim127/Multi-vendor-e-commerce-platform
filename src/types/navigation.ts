/**
 * Type definitions for Marketplace Navigation and Shell Architecture.
 */

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  description?: string;
  featured?: boolean;
  external?: boolean;
  children?: NavigationItem[];
}

export interface MegaMenuColumn {
  id: string;
  title: string;
  items: NavigationItem[];
}

export interface MegaMenuFeatured {
  title: string;
  description: string;
  imageUrl?: string;
  href: string;
  ctaText: string;
}

export interface MegaMenuCategory {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  columns: MegaMenuColumn[];
  featured?: MegaMenuFeatured;
}

export interface TopUtilityLink {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface MobileBottomNavItem {
  id: string;
  label: string;
  href: string;
  icon: 'home' | 'categories' | 'search' | 'wishlist' | 'cart' | 'account';
  badgeCount?: number;
}
