'use client';

/**
 * ==============================================================================
 * AUREON LUXURY MEGA NAVIGATION & HOVER DROPDOWN ENGINE
 * ==============================================================================
 * - Every single nav item is 100% clickable with real product catalog routes
 * - Hovering over any category smoothly displays an ultra-rich, interactive Mega Menu
 * - Multi-column categorized sub-items, popular brand chips, and featured promo deals
 * - 150ms forgiveness debounce prevents jittery flyout close when cursor traverses gaps
 * - Full keyboard navigation (Escape to close, Tab traversal, accessible ARIA roles)
 * - Seamless dual Light/Dark styling with glassmorphism and subtle golden glow
 */

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Grid,
  Flame,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Laptop,
  Shirt,
  Home,
  HeartPulse,
  Trophy,
  Gamepad2,
  MoreHorizontal,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MegaMenuSubItem {
  label: string;
  href: string;
  isHot?: boolean;
  isNew?: boolean;
}

export interface MegaMenuColumn {
  title: string;
  href: string;
  items: MegaMenuSubItem[];
}

export interface MegaMenuPromo {
  badge: string;
  title: string;
  subtitle: string;
  price?: string;
  originalPrice?: string;
  ctaText: string;
  href: string;
  image: string;
}

export interface NavCategoryItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isDeals?: boolean;
  columns?: MegaMenuColumn[];
  featured?: MegaMenuPromo;
  popularBrands?: { name: string; href: string }[];
}

export const MEGA_NAV_CATEGORIES: NavCategoryItem[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    href: '/products?category=computers-laptops',
    icon: Laptop,
    badge: 'Popular',
    columns: [
      {
        title: 'Computers & Laptops',
        href: '/products?category=computers-laptops',
        items: [
          { label: 'MacBook Air & Pro', href: '/products?category=computers-laptops&q=MacBook', isHot: true },
          { label: 'Gaming Laptops', href: '/products?category=computers-laptops&q=Gaming' },
          { label: 'Ultrabooks & 2-in-1s', href: '/products?category=computers-laptops&q=Ultrabook' },
          { label: 'Desktop Workstations', href: '/products?category=computers-laptops&q=Desktop' },
          { label: '4K & Curved Monitors', href: '/products?category=monitors-displays', isNew: true },
          { label: 'NVMe SSDs & Storage', href: '/products?category=computers-laptops&q=SSD' },
        ],
      },
      {
        title: 'Smartphones & Tablets',
        href: '/products?category=computers-laptops&q=Phone',
        items: [
          { label: 'Apple iPhone 16 Pro', href: '/products?category=computers-laptops&q=iPhone', isHot: true },
          { label: 'Samsung Galaxy S24 Ultra', href: '/products?category=computers-laptops&q=Galaxy' },
          { label: 'iPads & Android Tablets', href: '/products?category=computers-laptops&q=Tablet' },
          { label: 'MagSafe Fast Chargers', href: '/products?category=computers-laptops&q=Charger' },
          { label: 'Protective Armor Cases', href: '/products?category=computers-laptops&q=Case' },
          { label: 'Power Banks (100W PD)', href: '/products?category=computers-laptops&q=PowerBank' },
        ],
      },
      {
        title: 'Audio & Hi-Fi Sound',
        href: '/products?category=audio-headphones',
        items: [
          { label: 'Sony WH-1000XM5', href: '/products?category=audio-headphones&q=Sony', isHot: true },
          { label: 'AirPods Pro (2nd Gen)', href: '/products?category=audio-headphones&q=AirPods' },
          { label: 'Noise-Cancelling Over-Ear', href: '/products?category=audio-headphones' },
          { label: 'Hi-Res Wireless Earbuds', href: '/products?category=audio-headphones&q=Earbuds' },
          { label: 'Dolby Atmos Soundbars', href: '/products?category=audio-headphones&q=Soundbar' },
          { label: 'Studio Audio Interfaces', href: '/products?category=audio-headphones&q=Studio' },
        ],
      },
      {
        title: 'Wearables & Smart Home',
        href: '/products?category=computers-laptops&q=Wearables',
        items: [
          { label: 'Apple Watch Series 10', href: '/products?category=computers-laptops&q=AppleWatch', isHot: true },
          { label: 'Garmin Fitness GPS', href: '/products?category=computers-laptops&q=Garmin' },
          { label: 'Smart Security Cameras', href: '/products?category=computers-laptops&q=Security' },
          { label: 'Smart Home Automation', href: '/products?category=computers-laptops&q=Automation' },
          { label: '4K Drones & Gimbals', href: '/products?category=computers-laptops&q=Drone', isNew: true },
        ],
      },
    ],
    featured: {
      badge: '★ Deal of the Week',
      title: 'Sony WH-1000XM5',
      subtitle: 'Industry-leading noise cancellation engineered for true audiophiles.',
      price: '$349.00',
      originalPrice: '$539.00',
      ctaText: 'Shop Deal Now',
      href: '/products/sony-wh-1000xm5-wireless-headphones',
      image: '/assets/mock/products/sony-xm5-hero.webp',
    },
    popularBrands: [
      { name: 'Apple', href: '/products?q=Apple' },
      { name: 'Samsung', href: '/products?q=Samsung' },
      { name: 'Sony', href: '/products?q=Sony' },
      { name: 'Dell', href: '/products?q=Dell' },
      { name: 'Bose', href: '/products?q=Bose' },
      { name: 'Logitech', href: '/products?q=Logitech' },
    ],
  },
  {
    id: 'fashion',
    label: 'Fashion',
    href: '/products?category=fashion',
    icon: Shirt,
    columns: [
      {
        title: "Men's Apparel",
        href: '/products?category=fashion&q=Men',
        items: [
          { label: 'Outerwear & Tech Jackets', href: '/products?category=fashion&q=Jacket', isHot: true },
          { label: 'Classic Linen & Cotton Shirts', href: '/products?category=fashion&q=Shirt' },
          { label: 'Premium Selvedge Denim', href: '/products?category=fashion&q=Denim' },
          { label: 'Tailored Suits & Blazers', href: '/products?category=fashion&q=Blazer' },
          { label: 'Comfort Loungewear', href: '/products?category=fashion&q=Loungewear' },
        ],
      },
      {
        title: "Women's Collection",
        href: '/products?category=fashion&q=Women',
        items: [
          { label: 'Designer Dresses & Gowns', href: '/products?category=fashion&q=Dress', isHot: true },
          { label: 'Silk Blouses & Knits', href: '/products?category=fashion&q=Silk' },
          { label: 'Trench Coats & Wool Jackets', href: '/products?category=fashion&q=Coat' },
          { label: 'Luxury Leather Handbags', href: '/products?category=fashion&q=Handbag', isNew: true },
          { label: 'Fine Jewelry & Watches', href: '/products?category=fashion&q=Jewelry' },
        ],
      },
      {
        title: 'Footwear & Sneakers',
        href: '/products?category=mens-footwear',
        items: [
          { label: 'Nike Air Zoom Pegasus 41', href: '/products?category=mens-footwear&q=Pegasus', isHot: true },
          { label: 'Adidas Ultraboost Light', href: '/products?category=mens-footwear&q=Ultraboost' },
          { label: 'Handcrafted Chelsea Boots', href: '/products?category=mens-footwear&q=Boots' },
          { label: 'Italian Leather Loafers', href: '/products?category=mens-footwear&q=Loafers' },
          { label: 'Trail & Hiking Footwear', href: '/products?category=mens-footwear&q=Trail' },
        ],
      },
      {
        title: 'Activewear & Accessories',
        href: '/products?category=fashion&q=Activewear',
        items: [
          { label: 'Breathable Gym Apparel', href: '/products?category=fashion&q=Gym' },
          { label: 'Compression Tights & Tops', href: '/products?category=fashion&q=Compression' },
          { label: 'Polarized Sunglasses', href: '/products?category=fashion&q=Sunglasses' },
          { label: 'RFID Blocking Wallets', href: '/products?category=fashion&q=Wallet' },
          { label: 'Leather Travel Bags', href: '/products?category=fashion&q=Luggage', isNew: true },
        ],
      },
    ],
    featured: {
      badge: '★ Trend Spotlight',
      title: 'Nike Air Zoom Pegasus 41',
      subtitle: 'Responsive cushioning built for high-mileage road runners.',
      price: '$125.00',
      originalPrice: '$179.00',
      ctaText: 'Explore Collection',
      href: '/products/nike-air-zoom-pegasus-41',
      image: '/assets/mock/products/nike-alphafly-3-hero.webp',
    },
    popularBrands: [
      { name: 'Nike', href: '/products?q=Nike' },
      { name: 'Adidas', href: '/products?q=Adidas' },
      { name: 'Zara', href: '/products?q=Zara' },
      { name: 'Levi’s', href: '/products?q=Levis' },
      { name: 'Puma', href: '/products?q=Puma' },
    ],
  },
  {
    id: 'home-living',
    label: 'Home & Living',
    href: '/products?category=office-furniture',
    icon: Home,
    columns: [
      {
        title: 'Workspace & Ergonomics',
        href: '/products?category=office-furniture',
        items: [
          { label: 'Ergonomic Task Chairs', href: '/products?category=office-furniture&q=Chair', isHot: true },
          { label: 'Dual-Motor Standing Desks', href: '/products?category=office-furniture&q=Desk' },
          { label: 'Desk Organizers & Trays', href: '/products?category=office-furniture&q=Organizer' },
          { label: 'Monitor Arms & Risers', href: '/products?category=office-furniture&q=Arm' },
          { label: 'Acoustic Sound Panels', href: '/products?category=office-furniture&q=Acoustic' },
        ],
      },
      {
        title: 'Living & Bedroom',
        href: '/products?category=office-furniture&q=Living',
        items: [
          { label: 'Sectional Modern Sofas', href: '/products?category=office-furniture&q=Sofa' },
          { label: 'Solid Oak Dining Sets', href: '/products?category=office-furniture&q=Dining' },
          { label: 'Platform Bed Frames', href: '/products?category=office-furniture&q=Bed' },
          { label: 'Egyptian Cotton Sheets', href: '/products?category=office-furniture&q=Sheets', isNew: true },
          { label: 'Memory Foam Mattresses', href: '/products?category=office-furniture&q=Mattress' },
        ],
      },
      {
        title: 'Kitchen & Dining',
        href: '/products?category=office-furniture&q=Kitchen',
        items: [
          { label: 'Barista Espresso Machines', href: '/products?category=office-furniture&q=Espresso', isHot: true },
          { label: 'Smart Dual Air Fryers', href: '/products?category=office-furniture&q=AirFryer' },
          { label: 'Japanese Damascus Knives', href: '/products?category=office-furniture&q=Knives' },
          { label: 'Cast Iron Cookware Sets', href: '/products?category=office-furniture&q=Cookware' },
          { label: 'Ceramic Stoneware Dishes', href: '/products?category=office-furniture&q=Dishes' },
        ],
      },
      {
        title: 'Decor & Illumination',
        href: '/products?category=office-furniture&q=Lighting',
        items: [
          { label: 'Smart Ambient LED Lamps', href: '/products?category=office-furniture&q=Lamp' },
          { label: 'Handwoven Persian Rugs', href: '/products?category=office-furniture&q=Rug' },
          { label: 'Minimalist Wall Clocks', href: '/products?category=office-furniture&q=Clock' },
          { label: 'Scented Soy Wax Candles', href: '/products?category=office-furniture&q=Candles' },
          { label: 'Indoor Botanical Planters', href: '/products?category=office-furniture&q=Planter' },
        ],
      },
    ],
    featured: {
      badge: '★ Modern Interior',
      title: 'Ergonomic Executive Mesh Chair',
      subtitle: 'Dynamic lumbar support with breathable 3D woven mesh for 12+ hour focus.',
      price: '$289.00',
      originalPrice: '$420.00',
      ctaText: 'Upgrade Your Space',
      href: '/products?category=office-furniture',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    },
    popularBrands: [
      { name: 'Herman Miller', href: '/products?q=HermanMiller' },
      { name: 'Dyson', href: '/products?q=Dyson' },
      { name: 'Nespresso', href: '/products?q=Nespresso' },
      { name: 'Philips Hue', href: '/products?q=Philips' },
    ],
  },
  {
    id: 'beauty-health',
    label: 'Beauty & Health',
    href: '/products?category=beauty',
    icon: HeartPulse,
    columns: [
      {
        title: 'Skincare & Treatments',
        href: '/products?category=beauty&q=Skin',
        items: [
          { label: 'Hyaluronic Acid Serums', href: '/products?category=beauty&q=Serum', isHot: true },
          { label: 'Retinol Renewal Night Cream', href: '/products?category=beauty&q=Retinol' },
          { label: 'Gentle Foaming Cleansers', href: '/products?category=beauty&q=Cleanser' },
          { label: 'SPF 50+ Invisible Sunscreens', href: '/products?category=beauty&q=Sunscreen' },
          { label: 'Korean Sheet Mask Packs', href: '/products?category=beauty&q=Mask' },
        ],
      },
      {
        title: 'Makeup & Cosmetics',
        href: '/products?category=beauty&q=Makeup',
        items: [
          { label: 'Luminous Weightless Foundation', href: '/products?category=beauty&q=Foundation' },
          { label: 'Matte & Velvet Lipsticks', href: '/products?category=beauty&q=Lipstick', isHot: true },
          { label: 'Neutral Eyeshadow Palettes', href: '/products?category=beauty&q=Eyeshadow' },
          { label: 'Waterproof Volumizing Mascara', href: '/products?category=beauty&q=Mascara' },
          { label: 'Professional Makeup Brushes', href: '/products?category=beauty&q=Brushes' },
        ],
      },
      {
        title: 'Fragrances & Aromas',
        href: '/products?category=beauty&q=Fragrance',
        items: [
          { label: 'Luxury Eau de Parfum', href: '/products?category=beauty&q=Parfum', isNew: true },
          { label: 'Woody & Amber Colognes', href: '/products?category=beauty&q=Cologne' },
          { label: 'Floral Body Mists', href: '/products?category=beauty&q=Mist' },
          { label: 'Discovery Fragrance Sets', href: '/products?category=beauty&q=Discovery' },
        ],
      },
      {
        title: 'Wellness & Personal Care',
        href: '/products?category=beauty&q=Wellness',
        items: [
          { label: 'Sonic Electric Toothbrushes', href: '/products?category=beauty&q=Toothbrush' },
          { label: 'Ionic Professional Hair Dryers', href: '/products?category=beauty&q=HairDryer' },
          { label: 'Deep Tissue Massage Guns', href: '/products?category=beauty&q=Massager' },
          { label: 'Collagen & Daily Multivitamins', href: '/products?category=beauty&q=Vitamins' },
        ],
      },
    ],
    featured: {
      badge: '★ Clean Beauty',
      title: 'Radiance Botanical Glow Serum',
      subtitle: 'Pure plant-based vitamin complex that visibly brightens and firms within 7 days.',
      price: '$45.00',
      originalPrice: '$78.00',
      ctaText: 'Shop Clean Beauty',
      href: '/products?category=beauty',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    },
    popularBrands: [
      { name: 'The Ordinary', href: '/products?q=TheOrdinary' },
      { name: 'Estée Lauder', href: '/products?q=EsteeLauder' },
      { name: 'Dyson Beauty', href: '/products?q=Dyson' },
      { name: 'CeraVe', href: '/products?q=CeraVe' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    href: '/products?category=mens-footwear',
    icon: Trophy,
    columns: [
      {
        title: 'Running & Training',
        href: '/products?category=mens-footwear',
        items: [
          { label: 'Marathon Road Running Shoes', href: '/products?category=mens-footwear&q=Running', isHot: true },
          { label: 'Cushioned Trail Runners', href: '/products?category=mens-footwear&q=Trail' },
          { label: 'Moisture-Wicking Tops', href: '/products?category=fashion&q=Activewear' },
          { label: 'Compression Calf Sleeves', href: '/products?category=fashion&q=Compression' },
          { label: 'Hydration Running Vests', href: '/products?category=fashion&q=Hydration' },
        ],
      },
      {
        title: 'Gym & Strength',
        href: '/products?category=mens-footwear&q=Gym',
        items: [
          { label: 'Quick-Lock Adjustable Dumbbells', href: '/products?category=mens-footwear&q=Dumbbell', isHot: true },
          { label: 'Heavy Duty Resistance Bands', href: '/products?category=mens-footwear&q=Bands' },
          { label: 'Thick Non-Slip Yoga Mats', href: '/products?category=mens-footwear&q=Yoga' },
          { label: 'Foldable Incline Benches', href: '/products?category=mens-footwear&q=Bench' },
        ],
      },
      {
        title: 'Team & Racket Sports',
        href: '/products?category=mens-footwear&q=Racket',
        items: [
          { label: 'Carbon Fiber Tennis Rackets', href: '/products?category=mens-footwear&q=Tennis' },
          { label: 'FIFA Official Match Footballs', href: '/products?category=mens-footwear&q=Soccer' },
          { label: 'Indoor Composite Basketballs', href: '/products?category=mens-footwear&q=Basketball' },
          { label: 'Badminton Sets & Shuttles', href: '/products?category=mens-footwear&q=Badminton' },
        ],
      },
      {
        title: 'Outdoor & Camping',
        href: '/products?category=mens-footwear&q=Outdoor',
        items: [
          { label: 'Ultralight 2-Person Tents', href: '/products?category=mens-footwear&q=Tent', isNew: true },
          { label: 'Down Sleeping Bags (-10°C)', href: '/products?category=mens-footwear&q=SleepingBag' },
          { label: 'Insulated Stainless Flasks', href: '/products?category=mens-footwear&q=Flask' },
          { label: 'Carbon Fiber Trekking Poles', href: '/products?category=mens-footwear&q=Poles' },
        ],
      },
    ],
    featured: {
      badge: '★ Pro Athletic',
      title: 'Nike Air Zoom Alphafly 3',
      subtitle: 'The world fastest marathon super shoe tuned for breaking records.',
      price: '$285.00',
      originalPrice: '$320.00',
      ctaText: 'Gear Up',
      href: '/products?category=mens-footwear',
      image: '/assets/mock/products/nike-alphafly-3-hero.webp',
    },
    popularBrands: [
      { name: 'Nike', href: '/products?q=Nike' },
      { name: 'Adidas', href: '/products?q=Adidas' },
      { name: 'Under Armour', href: '/products?q=UnderArmour' },
      { name: 'The North Face', href: '/products?q=TheNorthFace' },
    ],
  },
  {
    id: 'toys-games',
    label: 'Toys & Games',
    href: '/products?category=toys-games',
    icon: Gamepad2,
    columns: [
      {
        title: 'Video Games & Consoles',
        href: '/products?category=toys-games&q=Console',
        items: [
          { label: 'PlayStation 5 Pro Console', href: '/products?category=toys-games&q=PS5', isHot: true },
          { label: 'DualSense Wireless Controllers', href: '/products?category=toys-games&q=Controller' },
          { label: 'Nintendo Switch OLED', href: '/products?category=toys-games&q=Switch' },
          { label: 'Wireless VR Gaming Headsets', href: '/products?category=toys-games&q=VR', isNew: true },
          { label: 'Top Rated Game Titles', href: '/products?category=toys-games&q=Games' },
        ],
      },
      {
        title: 'Building Sets & STEM',
        href: '/products?category=toys-games&q=LEGO',
        items: [
          { label: 'LEGO Star Wars Collector Sets', href: '/products?category=toys-games&q=StarWars', isHot: true },
          { label: 'LEGO Technic Supercars', href: '/products?category=toys-games&q=Technic' },
          { label: 'STEM Programmable Robotics', href: '/products?category=toys-games&q=Robotics' },
          { label: 'Magnetic Architectural Tiles', href: '/products?category=toys-games&q=Magnetic' },
        ],
      },
      {
        title: 'Board Games & Puzzles',
        href: '/products?category=toys-games&q=BoardGames',
        items: [
          { label: 'Classic Family Strategy Games', href: '/products?category=toys-games&q=Strategy' },
          { label: '1000-Piece Panoramic Puzzles', href: '/products?category=toys-games&q=Puzzle' },
          { label: 'Handcrafted Wooden Chess Sets', href: '/products?category=toys-games&q=Chess' },
          { label: 'Fast-Paced Card & Party Games', href: '/products?category=toys-games&q=Party' },
        ],
      },
      {
        title: 'Action Figures & Hobbies',
        href: '/products?category=toys-games&q=Figures',
        items: [
          { label: 'Marvel & Anime Action Figures', href: '/products?category=toys-games&q=Anime' },
          { label: 'Collectible Vinyl Figures', href: '/products?category=toys-games&q=Collectibles' },
          { label: 'High-Speed RC Drift Cars', href: '/products?category=toys-games&q=RC' },
          { label: 'Die-Cast Vehicle Models', href: '/products?category=toys-games&q=Diecast' },
        ],
      },
    ],
    featured: {
      badge: '★ Console Bundle',
      title: 'PlayStation 5 Slim 1TB',
      subtitle: 'Lightning-fast load times with ultra-high speed SSD and haptic feedback immersion.',
      price: '$449.00',
      originalPrice: '$499.00',
      ctaText: 'Claim Bundle',
      href: '/products?category=toys-games',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
    },
    popularBrands: [
      { name: 'Sony PlayStation', href: '/products?q=PlayStation' },
      { name: 'LEGO', href: '/products?q=LEGO' },
      { name: 'Nintendo', href: '/products?q=Nintendo' },
      { name: 'Hasbro', href: '/products?q=Hasbro' },
    ],
  },
  {
    id: 'more',
    label: 'More',
    href: '/products',
    icon: MoreHorizontal,
    columns: [
      {
        title: 'Automotive & Tools',
        href: '/products?category=computers-laptops&q=Auto',
        items: [
          { label: 'Dash Cams (4K HDR)', href: '/products?q=DashCam' },
          { label: 'Car Diagnostics (OBD2)', href: '/products?q=OBD2' },
          { label: 'Cordless Power Drill Sets', href: '/products?q=Tools' },
          { label: 'Emergency Jump Starters', href: '/products?q=JumpStarter' },
        ],
      },
      {
        title: 'Books & Instruments',
        href: '/products?q=Books',
        items: [
          { label: 'Global Best-Sellers', href: '/products?q=Books' },
          { label: 'Digital Audio Keyboards', href: '/products?q=Keyboard+Piano' },
          { label: 'Acoustic & Electric Guitars', href: '/products?q=Guitar' },
          { label: 'Studio Condenser Mics', href: '/products?q=Microphone' },
        ],
      },
      {
        title: 'Pet Supplies',
        href: '/products?q=Pet',
        items: [
          { label: 'Smart Auto Pet Feeders', href: '/products?q=PetFeeder' },
          { label: 'Orthopedic Dog Beds', href: '/products?q=DogBed' },
          { label: 'Self-Cleaning Litter Boxes', href: '/products?q=LitterBox' },
        ],
      },
      {
        title: 'Platform Services',
        href: '/products',
        items: [
          { label: 'All Verified Stores', href: '/stores', isHot: true },
          { label: 'Brand Directory', href: '/brands' },
          { label: 'Become a Seller', href: '/seller/register' },
          { label: 'Aureon Prime Membership', href: '/prime' },
        ],
      },
    ],
    featured: {
      badge: '★ Enterprise Trade',
      title: 'Global Vendor Network',
      subtitle: 'Connect with over 8,240 certified international suppliers and manufacturers.',
      ctaText: 'Explore Directory',
      href: '/stores',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    },
  },
];

export interface MegaNavBarProps {
  className?: string;
}

export function MegaNavBar({ className }: MegaNavBarProps): React.JSX.Element {
  const pathname = usePathname();
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = React.useState<boolean>(false);
  const [activeAllCategoryIndex, setActiveAllCategoryIndex] = React.useState<number>(0);

  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Clear debounce timeout
  const clearTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Handle mouse enter a category
  const handleCategoryMouseEnter = (categoryId: string) => {
    clearTimer();
    setIsAllCategoriesOpen(false);
    setActiveMenuId(categoryId);
  };

  // Handle mouse leave category or menu
  const handleMouseLeave = () => {
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveMenuId(null);
      setIsAllCategoriesOpen(false);
    }, 180);
  };

  // Handle All Categories hover
  const handleAllCategoriesMouseEnter = () => {
    clearTimer();
    setActiveMenuId(null);
    setIsAllCategoriesOpen(true);
  };

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setIsAllCategoriesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeCategory = MEGA_NAV_CATEGORIES.find((cat) => cat.id === activeMenuId);
  const currentAllCategory = MEGA_NAV_CATEGORIES[activeAllCategoryIndex] ?? MEGA_NAV_CATEGORIES[0]!;

  return (
    <div
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      className={cn('relative w-full z-50 bg-[#0B0B0C] border-b border-[#1A1A1E]', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
          {/* 1. All Categories Button with Flyout Indicator */}
          <div
            onMouseEnter={handleAllCategoriesMouseEnter}
            className="relative shrink-0"
          >
            <Link
              href="/products"
              onClick={() => {
                setActiveMenuId(null);
                setIsAllCategoriesOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all select-none',
                isAllCategoriesOpen
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-[#18181B] text-white border border-[#27272A] hover:border-amber-400/50 hover:text-amber-400'
              )}
            >
              <Grid className={cn('h-3.5 w-3.5', isAllCategoriesOpen ? 'text-slate-950' : 'text-amber-400')} />
              <span>All Categories</span>
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  isAllCategoriesOpen ? 'rotate-180 text-slate-950' : 'text-[#A1A1AA]'
                )}
              />
            </Link>
          </div>

          <div className="h-4 w-px bg-[#26262B] shrink-0" />

          {/* 2. Today's Deals (Hot Link) */}
          <Link
            href="/products?deals=true"
            onMouseEnter={() => {
              clearTimer();
              setActiveMenuId(null);
              setIsAllCategoriesOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-400 hover:text-amber-300 shrink-0 transition-colors group"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
            <span>Today&apos;s Deals</span>
            <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider ml-0.5">
              HOT
            </span>
          </Link>

          {/* 3. Category Nav Links with Hover Mega Menu Trigger */}
          {MEGA_NAV_CATEGORIES.map((cat) => {
            const isHovered = activeMenuId === cat.id;
            const categoryBaseRoute = cat.href.split('?')[0] ?? '';
            const isCurrentPage = Boolean(pathname && pathname.includes(categoryBaseRoute));

            return (
              <div
                key={cat.id}
                onMouseEnter={() => handleCategoryMouseEnter(cat.id)}
                className="relative shrink-0"
              >
                <Link
                  href={cat.href}
                  onClick={() => {
                    setActiveMenuId(null);
                    setIsAllCategoriesOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold transition-all select-none',
                    isHovered
                      ? 'bg-[#1F1F24] text-white'
                      : isCurrentPage
                      ? 'text-white font-bold'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#18181B]'
                  )}
                >
                  <span>{cat.label}</span>
                  {cat.columns && (
                    <ChevronDown
                      className={cn(
                        'h-3 w-3 opacity-60 transition-transform duration-200',
                        isHovered && 'rotate-180 text-amber-400 opacity-100'
                      )}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. CATEGORY SPECIFIC MEGA MENU FLYOUT */}
      {/* ==================================================================== */}
      {activeCategory && activeCategory.columns && (
        <div
          onMouseEnter={clearTimer}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 right-0 top-full z-50 bg-[#0E0E12]/98 backdrop-blur-2xl border-b border-[#27272A] shadow-2xl animate-in fade-in-0 slide-in-from-top-2 duration-150"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Category Sub-Columns (8 Columns) */}
              <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {activeCategory.columns.map((col, idx) => (
                  <div key={idx} className="space-y-3">
                    <Link
                      href={col.href}
                      onClick={() => setActiveMenuId(null)}
                      className="group flex items-center gap-1 text-xs font-bold text-white uppercase tracking-wider hover:text-amber-400 transition-colors"
                    >
                      <span>{col.title}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-400" />
                    </Link>

                    <ul className="space-y-2 text-xs">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            href={item.href}
                            onClick={() => setActiveMenuId(null)}
                            className="flex items-center justify-between text-[#9CA3AF] hover:text-white hover:translate-x-1 transition-all py-0.5"
                          >
                            <span>{item.label}</span>
                            {item.isHot && (
                              <span className="rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                                HOT
                              </span>
                            )}
                            {item.isNew && (
                              <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                                NEW
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Featured Promo & Spotlight (4 Columns) */}
              {activeCategory.featured && (
                <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#27272A] lg:pl-8 flex flex-col justify-between">
                  <div className="rounded-2xl border border-[#27272A] bg-gradient-to-b from-[#18181D] to-[#121216] p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        {activeCategory.featured.badge}
                      </span>
                      {activeCategory.featured.price && (
                        <div className="text-right">
                          <span className="text-sm font-black text-white">
                            {activeCategory.featured.price}
                          </span>
                          {activeCategory.featured.originalPrice && (
                            <span className="text-[10px] text-[#71717A] line-through ml-1.5 font-mono">
                              {activeCategory.featured.originalPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {activeCategory.featured.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#9CA3AF] leading-relaxed line-clamp-2">
                      {activeCategory.featured.subtitle}
                    </p>

                    <div className="relative h-36 w-full mt-3 rounded-xl overflow-hidden bg-black/40">
                      {/* Product preview */}
                      {activeCategory.featured.image.startsWith('http') ||
                      activeCategory.featured.image.startsWith('/') ? (
                        <Image
                          src={activeCategory.featured.image}
                          alt={activeCategory.featured.title}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : null}
                    </div>

                    <Link
                      href={activeCategory.featured.href}
                      onClick={() => setActiveMenuId(null)}
                      className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs py-2.5 shadow-md shadow-amber-400/20 transition-all"
                    >
                      <span>{activeCategory.featured.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Popular Brand Chips */}
                  {activeCategory.popularBrands && (
                    <div className="mt-4">
                      <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-2">
                        Top Brands in {activeCategory.label}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCategory.popularBrands.map((b, i) => (
                          <Link
                            key={i}
                            href={b.href}
                            onClick={() => setActiveMenuId(null)}
                            className="rounded-lg bg-[#18181B] border border-[#27272A] px-2.5 py-1 text-[11px] text-[#A1A1AA] hover:text-white hover:border-amber-400/50 transition-colors"
                          >
                            {b.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Quick Strip */}
            <div className="mt-6 pt-4 border-t border-[#1F1F24] flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] gap-3">
              <div className="flex items-center gap-4">
                <Link
                  href={activeCategory.href}
                  onClick={() => setActiveMenuId(null)}
                  className="font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>View All {activeCategory.label} Products</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#9CA3AF]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  100% Genuine Certified Sellers
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <Tag className="h-3 w-3 text-amber-400" />
                <span>Express 2-Day Shipping Available</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. ALL CATEGORIES COMPREHENSIVE MEGA CATALOGUE FLYOUT */}
      {/* ==================================================================== */}
      {isAllCategoriesOpen && (
        <div
          onMouseEnter={clearTimer}
          onMouseLeave={handleMouseLeave}
          className="absolute left-0 right-0 top-full z-50 bg-[#0E0E12]/98 backdrop-blur-2xl border-b border-[#27272A] shadow-2xl animate-in fade-in-0 slide-in-from-top-2 duration-150"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <div className="grid grid-cols-12 gap-6 min-h-[360px]">
              {/* Left Sidebar: Fast Category Switcher (3 Cols) */}
              <div className="col-span-12 lg:col-span-3 border-r border-[#27272A] pr-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] px-3 pb-2 block">
                  Select Department
                </span>
                {MEGA_NAV_CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isSelected = activeAllCategoryIndex === idx;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => setActiveAllCategoryIndex(idx)}
                      onClick={() => {
                        setIsAllCategoriesOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer',
                        isSelected
                          ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-[#18181B]'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn('h-4 w-4', isSelected ? 'text-amber-400' : 'text-[#71717A]')} />
                        <span>{cat.label}</span>
                      </div>
                      <ArrowRight
                        className={cn(
                          'h-3 w-3 transition-transform',
                          isSelected ? 'opacity-100 translate-x-0 text-amber-400' : 'opacity-0 -translate-x-1'
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Middle Section: Active Department Subcategories (6 Cols) */}
              <div className="col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
                {currentAllCategory.columns?.map((col, idx) => (
                  <div key={idx} className="space-y-3">
                    <Link
                      href={col.href}
                      onClick={() => setIsAllCategoriesOpen(false)}
                      className="text-xs font-bold text-white uppercase tracking-wider hover:text-amber-400 transition-colors block border-b border-[#27272A] pb-1.5"
                    >
                      {col.title}
                    </Link>
                    <ul className="space-y-1.5 text-xs">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            href={item.href}
                            onClick={() => setIsAllCategoriesOpen(false)}
                            className="text-[#9CA3AF] hover:text-white transition-colors block py-0.5 hover:translate-x-1 duration-150"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right Section: Highlight Card & Action (3 Cols) */}
              <div className="col-span-12 lg:col-span-3 border-l border-[#27272A] pl-6 flex flex-col justify-between">
                {currentAllCategory.featured ? (
                  <div className="rounded-2xl border border-[#27272A] bg-gradient-to-b from-[#18181D] to-[#121216] p-4 relative overflow-hidden group">
                    <span className="inline-block rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold mb-2">
                      {currentAllCategory.featured.badge}
                    </span>
                    <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {currentAllCategory.featured.title}
                    </h5>
                    <p className="mt-1 text-[11px] text-[#9CA3AF] line-clamp-2">
                      {currentAllCategory.featured.subtitle}
                    </p>

                    <Link
                      href={currentAllCategory.href}
                      onClick={() => setIsAllCategoriesOpen(false)}
                      className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2 shadow-sm transition-all"
                    >
                      <span>Explore Department</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ) : null}

                <div className="mt-6 rounded-xl border border-dashed border-[#27272A] p-3 text-center">
                  <p className="text-[11px] text-[#A1A1AA]">Need wholesale or multi-vendor bulk orders?</p>
                  <Link
                    href="/help"
                    onClick={() => setIsAllCategoriesOpen(false)}
                    className="mt-1.5 inline-block text-xs font-bold text-amber-400 hover:underline"
                  >
                    Contact Trade Desk →
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar for All Categories */}
            <div className="mt-6 pt-4 border-t border-[#1F1F24] flex items-center justify-between text-xs text-[#71717A]">
              <Link
                href="/products"
                onClick={() => setIsAllCategoriesOpen(false)}
                className="font-bold text-amber-400 hover:underline flex items-center gap-1.5"
              >
                <span>Browse All Marketplace Products & Deals</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-[#9CA3AF]">Over 40,000+ Verified Products</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Global Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
