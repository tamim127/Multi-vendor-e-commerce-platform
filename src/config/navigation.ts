import type {
  TopUtilityLink,
  NavigationItem,
  MegaMenuCategory,
  FooterSection,
  MobileBottomNavItem,
} from '@/types/navigation';

export const topUtilityLinks: TopUtilityLink[] = [
  { id: 'seller-portal', label: 'Become a Seller', href: '/seller/register' },
  { id: 'help-center', label: 'Help & Support', href: '/help' },
  { id: 'order-tracking', label: 'Track Order', href: '/orders/track' },
];

export const primaryNavigationLinks: NavigationItem[] = [
  { id: 'deals', label: 'Deals & Clearance', href: '/deals', badge: 'Hot' },
  { id: 'trending', label: 'Trending Today', href: '/trending' },
  { id: 'new-arrivals', label: 'New Arrivals', href: '/new-arrivals' },
  { id: 'brands', label: 'Top Brands', href: '/brands' },
  { id: 'stores', label: 'Verified Stores', href: '/stores' },
];

export const defaultMegaMenuCategories: MegaMenuCategory[] = [
  {
    id: 'electronics',
    label: 'Electronics & Devices',
    href: '/categories/electronics',
    icon: 'laptop',
    badge: 'Popular',
    columns: [
      {
        id: 'computing',
        title: 'Computers & Tablets',
        items: [
          { id: 'laptops', label: 'Performance Laptops', href: '/categories/laptops' },
          { id: 'desktops', label: 'Desktop Workstations', href: '/categories/desktops' },
          { id: 'monitors', label: 'Monitors & Displays', href: '/categories/monitors' },
          { id: 'storage', label: 'External Storage & SSDs', href: '/categories/storage' },
        ],
      },
      {
        id: 'mobile-audio',
        title: 'Smartphones & Audio',
        items: [
          { id: 'smartphones', label: 'Flagship Smartphones', href: '/categories/smartphones' },
          { id: 'headphones', label: 'Noise-Canceling Headphones', href: '/categories/headphones' },
          { id: 'earbuds', label: 'Wireless Earbuds', href: '/categories/earbuds' },
          { id: 'speakers', label: 'Smart Speakers', href: '/categories/speakers' },
        ],
      },
      {
        id: 'wearables-smart-home',
        title: 'Wearables & Smart Home',
        items: [
          {
            id: 'smartwatches',
            label: 'Smartwatches & Trackers',
            href: '/categories/smartwatches',
          },
          {
            id: 'security-cameras',
            label: 'Security & Surveillance',
            href: '/categories/security',
          },
          { id: 'lighting', label: 'Smart Lighting & Sensors', href: '/categories/lighting' },
        ],
      },
    ],
    featured: {
      title: 'Next-Gen Computing',
      description: 'Explore ultra-efficient workstations and enterprise mobility solutions.',
      href: '/categories/electronics/spotlight',
      ctaText: 'Discover Spotlight',
    },
  },
  {
    id: 'fashion',
    label: 'Fashion & Apparel',
    href: '/categories/fashion',
    icon: 'shirt',
    columns: [
      {
        id: 'mens-wear',
        title: "Men's Apparel",
        items: [
          { id: 'mens-jackets', label: 'Outerwear & Coats', href: '/categories/mens-outerwear' },
          { id: 'mens-tailoring', label: 'Suits & Tailoring', href: '/categories/mens-tailoring' },
          { id: 'mens-casual', label: 'Shirts & Denim', href: '/categories/mens-casual' },
        ],
      },
      {
        id: 'womens-wear',
        title: "Women's Collection",
        items: [
          { id: 'womens-dresses', label: 'Designer Dresses', href: '/categories/womens-dresses' },
          {
            id: 'womens-knitwear',
            label: 'Knitwear & Sweaters',
            href: '/categories/womens-knitwear',
          },
          { id: 'womens-shoes', label: 'Footwear & Boots', href: '/categories/womens-shoes' },
        ],
      },
      {
        id: 'accessories',
        title: 'Bags & Accessories',
        items: [
          { id: 'leather-bags', label: 'Leather Bags & Totes', href: '/categories/leather-bags' },
          { id: 'watches', label: 'Luxury Chronographs', href: '/categories/luxury-watches' },
          { id: 'eyewear', label: 'Optics & Sunglasses', href: '/categories/eyewear' },
        ],
      },
    ],
    featured: {
      title: 'Curated Autumn Capsule',
      description: 'Sustainably sourced tailoring and premium seasonal fabrics.',
      href: '/categories/fashion/autumn',
      ctaText: 'View Lookbook',
    },
  },
  {
    id: 'home-living',
    label: 'Home, Living & Decor',
    href: '/categories/home',
    icon: 'home',
    columns: [
      {
        id: 'furniture',
        title: 'Modern Furniture',
        items: [
          { id: 'sofas', label: 'Living Room Seating', href: '/categories/sofas' },
          { id: 'dining', label: 'Dining Sets & Tables', href: '/categories/dining' },
          { id: 'bedroom', label: 'Bedframes & Mattresses', href: '/categories/bedroom' },
        ],
      },
      {
        id: 'kitchen',
        title: 'Culinary & Dining',
        items: [
          { id: 'cookware', label: 'Artisan Cookware', href: '/categories/cookware' },
          { id: 'appliances', label: 'Countertop Appliances', href: '/categories/appliances' },
          { id: 'tableware', label: 'Fine Ceramic Dinnerware', href: '/categories/tableware' },
        ],
      },
    ],
  },
  {
    id: 'beauty-wellness',
    label: 'Beauty & Wellness',
    href: '/categories/beauty',
    icon: 'sparkles',
    columns: [
      {
        id: 'skincare',
        title: 'Advanced Skincare',
        items: [
          { id: 'serums', label: 'Targeted Serums & Peptides', href: '/categories/serums' },
          { id: 'cleansers', label: 'Hydrating Cleansers', href: '/categories/cleansers' },
          { id: 'sunscreen', label: 'Broad Spectrum SPF', href: '/categories/sunscreen' },
        ],
      },
      {
        id: 'wellness',
        title: 'Wellness & Rituals',
        items: [
          {
            id: 'aromatherapy',
            label: 'Diffusers & Botanical Oils',
            href: '/categories/aromatherapy',
          },
          {
            id: 'supplements',
            label: 'Clean Nutritional Supplements',
            href: '/categories/supplements',
          },
        ],
      },
    ],
  },
];

export const defaultFooterSections: FooterSection[] = [
  {
    id: 'customer-care',
    title: 'Customer Experience',
    links: [
      { id: 'help', label: 'Help & Documentation', href: '/help' },
      { id: 'track-order', label: 'Track Order', href: '/orders/track' },
      { id: 'returns', label: 'Returns & Refunds', href: '/returns' },
      { id: 'shipping-policy', label: 'Shipping Information', href: '/shipping' },
      { id: 'contact', label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    id: 'marketplace',
    title: 'Marketplace Ecosystem',
    links: [
      { id: 'about-us', label: 'About Our Platform', href: '/about' },
      { id: 'verified-stores', label: 'Verified Merchant Registry', href: '/stores' },
      { id: 'sustainability', label: 'Sustainable Commerce Pledge', href: '/sustainability' },
      { id: 'careers', label: 'Careers & Team', href: '/careers', badge: 'Hiring' },
      { id: 'press', label: 'Newsroom & Press', href: '/press' },
    ],
  },
  {
    id: 'seller-solutions',
    title: 'Sell & Partner',
    links: [
      { id: 'become-seller', label: 'Start Selling Today', href: '/seller/register' },
      { id: 'seller-hub', label: 'Seller Resource Hub', href: '/seller/hub' },
      { id: 'fulfillment', label: 'Marketplace Logistics Network', href: '/seller/fulfillment' },
      { id: 'b2b-wholesale', label: 'Wholesale & Enterprise B2B', href: '/wholesale' },
      { id: 'affiliates', label: 'Affiliate Program', href: '/affiliates' },
    ],
  },
  {
    id: 'governance',
    title: 'Security & Legal',
    links: [
      { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { id: 'terms', label: 'Terms of Service', href: '/terms' },
      { id: 'compliance', label: 'Compliance & Consumer Rights', href: '/compliance' },
      { id: 'security', label: 'Platform Security Architecture', href: '/security' },
      { id: 'cookies', label: 'Cookie Settings', href: '/cookies' },
    ],
  },
];

export const mobileBottomNavItems: MobileBottomNavItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: 'home' },
  { id: 'categories', label: 'Categories', href: '/categories', icon: 'categories' },
  { id: 'search', label: 'Search', href: '/search', icon: 'search' },
  { id: 'wishlist', label: 'Wishlist', href: '/wishlist', icon: 'wishlist' },
  { id: 'cart', label: 'Cart', href: '/cart', icon: 'cart', badgeCount: 3 },
];
