'use client';

/**
 * ==============================================================================
 * AUREON GLOBAL MULTI-VENDOR MARKETPLACE — HOMEPAGE
 * ==============================================================================
 * Ultra-premium, world-class e-commerce experience inspired by the Aureon design:
 * - Dark luxury topbar and intelligent search header
 * - Smooth category mega-nav with dropdowns
 * - Cinematic dark & warm gold hero showcase with interactive carousel
 * - Clean category discovery cards with soft shadows
 * - Dual promo grid: Flash Deals with live countdown & New Arrivals interior banner
 * - 5-column trending products with discount badges, wishlist toggle & quick add-to-cart
 * - Trusted brands strip with worldwide guarantees
 * - 3-column value cards: Aureon Prime, AI Shopping Assistant, and Mobile App
 * - Full dark luxury footer with newsletter subscription & localization
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Flame,
  Star,
  Heart,
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Play,
  Check,
  Truck,
  ShieldCheck,
  Headphones,
  Sparkles,
  Bot,
  Crown,
  Grid,
  Smartphone,
} from 'lucide-react';

import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { useAuth } from '@/features/auth';
import { useAIAssistant } from '@/features/ai';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import type { Product } from '@/domains/catalog/types/product';
import type { AddToCartInput } from '@/domains/cart/types/cart';

// Hero promotional carousel slides data
interface HeroSlide {
  id: string;
  badge: string;
  titleLight: string;
  titleGold: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  videoHref?: string;
  featuredSlug: string;
  image: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-next-gen',
    badge: '★ Big Sale • Up to 70% OFF',
    titleLight: 'Next-Gen Technology',
    titleGold: 'for a Better Tomorrow',
    subtitle: 'Discover premium products from trusted sellers around the world.',
    ctaText: 'Shop the Deal',
    ctaHref: '/products?deals=true',
    featuredSlug: 'apple-macbook-pro-16-m3-max',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'hero-audio-spatial',
    badge: '★ Flagship Sound • 35% OFF',
    titleLight: 'Acoustic Precision',
    titleGold: 'Wireless Hi-Fi Sound',
    subtitle: 'Industry-leading noise cancellation engineered for true audiophiles.',
    ctaText: 'Explore Audio',
    ctaHref: '/products?category=audio-headphones',
    featuredSlug: 'sony-wh-1000xm5-wireless-headphones',
    image: '/assets/mock/products/sony-xm5-hero.webp',
  },
  {
    id: 'hero-ultrawide-gaming',
    badge: '★ OLED Innovation • 240Hz',
    titleLight: 'Dual Curved Displays',
    titleGold: 'Infinite Immersion',
    subtitle: 'Quantum Dot OLED delivers pure blacks and lightning-fast 0.03ms response.',
    ctaText: 'Discover Monitors',
    ctaHref: '/products?category=monitors-displays',
    featuredSlug: 'samsung-odyssey-oled-g9-49',
    image: '/assets/mock/products/samsung-neo-g9.webp',
  },
];

// Clean category discovery cards
const CATEGORY_CARDS = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    discount: 'Up to 60% Off',
    slug: 'computers-laptops',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-fashion',
    name: 'Fashion',
    discount: 'Up to 50% Off',
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-home-living',
    name: 'Home & Living',
    discount: 'Up to 60% Off',
    slug: 'office-furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-beauty-health',
    name: 'Beauty & Health',
    discount: 'Up to 50% Off',
    slug: 'beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-sports',
    name: 'Sports',
    discount: 'Up to 50% Off',
    slug: 'mens-footwear',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cat-toys-games',
    name: 'Toys & Games',
    discount: 'Up to 50% Off',
    slug: 'toys-games',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=400&q=80',
  },
];

// 5 Curated Trending Products exactly matching the design
interface CuratedTrendingProduct {
  id: string;
  slug: string;
  title: string;
  category: string;
  badge: string;
  rating: number;
  reviews: string;
  price: number;
  originalPrice: number;
  image: string;
}

const TRENDING_PRODUCTS: CuratedTrendingProduct[] = [
  {
    id: 'prod-sony-xm5',
    slug: 'sony-wh-1000xm5-wireless-headphones',
    title: 'Sony WH-1000XM5',
    category: 'Wireless Headphones',
    badge: '-35%',
    rating: 4.8,
    reviews: '12.5k',
    price: 349.0,
    originalPrice: 539.0,
    image: '/assets/mock/products/sony-xm5-hero.webp',
  },
  {
    id: 'prod-apple-watch-10',
    slug: 'apple-watch-series-10',
    title: 'Apple Watch Series 10',
    category: 'GPS 42mm',
    badge: '-40%',
    rating: 4.7,
    reviews: '8.2k',
    price: 399.0,
    originalPrice: 669.0,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'prod-macbook-pro-16',
    slug: 'apple-macbook-pro-16-m3-max',
    title: 'MacBook Air M3',
    category: '13-inch',
    badge: '-25%',
    rating: 4.9,
    reviews: '6.1k',
    price: 1099.0,
    originalPrice: 1469.0,
    image: '/assets/mock/products/mbp16-hero.webp',
  },
  {
    id: 'prod-nike-pegasus',
    slug: 'nike-air-zoom-pegasus-41',
    title: 'Nike Air Zoom Pegasus 41',
    category: 'Running Shoes',
    badge: '-30%',
    rating: 4.7,
    reviews: '4.3k',
    price: 125.0,
    originalPrice: 179.0,
    image: '/assets/mock/products/nike-alphafly-3-hero.webp',
  },
  {
    id: 'prod-airpods-pro-2',
    slug: 'airpods-pro-2nd-gen',
    title: 'AirPods Pro (2nd Gen)',
    category: 'Wireless Earbuds',
    badge: '-20%',
    rating: 4.8,
    reviews: '9.7k',
    price: 249.0,
    originalPrice: 309.0,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500&q=80',
  },
];

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const { addItem, itemCount, openDrawer } = useCart();
  const { isInWishlist, toggleWishlist, itemCount: wishlistCount } = useWishlist();
  const { customer, isAuthenticated } = useAuth();
  const { toggleOpen: openAIAssistant } = useAIAssistant();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const selectedSearchCategory = 'All Categories';

  // Hero Carousel State
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Trending filter tabs
  const [trendingTab, setTrendingTab] = useState<'popular' | 'best' | 'rated' | 'new'>('popular');

  // Live Flash Deal countdown
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 14,
    minutes: 37,
    seconds: 25,
  });

  // Action toast state
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 2, hours: 14, minutes: 37, seconds: 25 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Search submission handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/products');
      return;
    }
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Add to cart from trending cards
  const handleAddToCart = (product: CuratedTrendingProduct) => {
    const input: AddToCartInput = {
      productId: product.id,
      slug: product.slug,
      title: { en: product.title },
      imageUrl: product.image,
      offerId: `offer-${product.id}`,
      sellerId: 'seller-tech-direct',
      sellerName: 'Aureon Official Flagship',
      unitPrice: {
        amountMinor: Math.round(product.price * 100),
        currency: 'USD',
      },
      quantity: 1,
    };
    addItem(input);
    triggerToast(`Added ${product.title} to your cart.`);
  };

  // Toggle wishlist from trending cards
  const handleToggleWishlist = (prod: CuratedTrendingProduct) => {
    const existing =
      MOCK_PRODUCTS.find((p) => p.id === prod.id || p.slug === prod.slug) ||
      ({
        ...MOCK_PRODUCTS[0]!,
        id: prod.id,
        slug: prod.slug,
        title: { en: prod.title },
      } as Product);

    const added = toggleWishlist(existing);
    triggerToast(added ? `Added ${prod.title} to wishlist` : `Removed from wishlist`);
  };

  const activeSlide = HERO_SLIDES[slideIndex] ?? HERO_SLIDES[0]!;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E2022] font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-[#0B0B0C]/95 text-white px-5 py-3.5 shadow-2xl backdrop-blur-md text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold">
            <Check className="h-3.5 w-3.5" />
          </div>
          <span>{toast}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. TOP UTILITY ANNOUNCEMENT BAR (Dark Charcoal Aureon Style) */}
      {/* ==================================================================== */}
      <div className="bg-[#0B0B0C] border-b border-[#1E1E22] text-xs text-[#9CA3AF] py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Announcement */}
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">⚡</span>
            <span className="font-medium text-white/90">
              Free Shipping on orders over $50
            </span>
            <span className="text-[#4B5563]">•</span>
            <span className="hidden sm:inline text-[#9CA3AF]">30 Days Free Return</span>
          </div>

          {/* Right Utility Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px]">
            <Link href="/help" className="hover:text-white transition-colors">
              Help
            </Link>
            <Link href="/account/orders" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <Link href="/seller" className="hover:text-white transition-colors">
              Seller Center
            </Link>
            <div className="h-3 w-px bg-[#26262B]" />
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <span>🇺🇸</span>
              <span>English</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <span>USD</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN HEADER (Brand Logo, Search Bar, Header Actions) */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0B0B0C] border-b border-[#1A1A1E] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
          {/* Aureon Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="text-slate-950 font-black text-lg tracking-tighter">▲</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                Aureon
              </span>
              <span className="text-[9px] tracking-wider text-[#9CA3AF] uppercase font-semibold mt-0.5">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Intelligent Search Input */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl items-center rounded-full bg-[#18181B] border border-[#27272A] p-1.5 focus-within:border-amber-400/80 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 bg-transparent px-4 py-1.5 text-xs sm:text-sm text-white placeholder-[#71717A] focus:outline-none"
            />
            {/* Category Dropdown Pill */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-[#A1A1AA] border-l border-[#27272A] px-3 py-1 cursor-pointer hover:text-white">
              <span>{selectedSearchCategory}</span>
              <ChevronDown className="h-3 w-3" />
            </div>
            {/* Search Button */}
            <button
              type="submit"
              aria-label="Search"
              className="h-9 w-9 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* User Account, Wishlist, Cart Actions */}
          <div className="flex items-center gap-4 sm:gap-6 text-white text-xs font-semibold shrink-0">
            {/* Account Action */}
            <Link
              href={isAuthenticated ? '/account' : '/login'}
              className="flex items-center gap-2 hover:text-amber-400 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-[#1F1F23] flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-[#A1A1AA] font-normal leading-tight">
                  {isAuthenticated ? 'Hello,' : 'Sign In'}
                </span>
                <span className="flex items-center gap-0.5 font-bold">
                  {isAuthenticated ? customer?.firstName || 'Account' : 'Account'}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </span>
              </div>
            </Link>

            {/* Wishlist Action */}
            <Link
              href="/wishlist"
              className="relative flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <div className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white rounded-full h-4 min-w-[16px] px-1 text-[9px] font-bold flex items-center justify-center leading-none">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            {/* Cart Action */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open Cart"
              className="relative flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 rounded-full h-4 min-w-[16px] px-1 text-[9px] font-bold flex items-center justify-center leading-none">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 3. CATEGORY NAVIGATION BAR (Mega Nav Pill) */}
      {/* ==================================================================== */}
      <nav className="bg-[#0B0B0C] border-b border-[#1A1A1E] text-xs text-[#D1D5DB] px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          {/* All Categories Button */}
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-full bg-[#18181B] text-white border border-[#27272A] hover:border-amber-400/50 px-4 py-2 font-bold shrink-0 transition-all"
          >
            <Grid className="h-3.5 w-3.5 text-amber-400" />
            <span>All Categories</span>
            <ChevronDown className="h-3 w-3 text-[#A1A1AA]" />
          </Link>

          {/* Quick Nav Links */}
          <Link
            href="/products?deals=true"
            className="font-bold text-amber-400 hover:text-amber-300 px-3 py-2 shrink-0 flex items-center gap-1"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            Today&apos;s Deals
          </Link>

          {[
            { name: 'Electronics', slug: 'computers-laptops' },
            { name: 'Fashion', slug: 'fashion' },
            { name: 'Home & Living', slug: 'office-furniture' },
            { name: 'Beauty & Health', slug: 'beauty' },
            { name: 'Sports', slug: 'mens-footwear' },
            { name: 'Toys & Games', slug: 'toys-games' },
            { name: 'More', slug: 'more' },
          ].map((item) => (
            <Link
              key={item.name}
              href={`/products?category=${item.slug}`}
              className="flex items-center gap-1 text-[#9CA3AF] hover:text-white px-3 py-2 shrink-0 font-medium transition-colors"
            >
              <span>{item.name}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Link>
          ))}
        </div>
      </nav>

      {/* ==================================================================== */}
      {/* 4. HERO SECTION (Cinematic Dark & Warm Gold Experience) */}
      {/* ==================================================================== */}
      <section
        className="px-4 sm:px-8 py-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0C0C0E] via-[#16130E] to-[#0A0A0C] border border-[#27272A] shadow-2xl p-6 sm:p-12 lg:p-16">
            {/* Ambient Lighting Background Accents */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Left Column: Headlines & Call to Actions */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Sale Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-3.5 py-1 text-xs font-bold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{activeSlide.badge}</span>
                </div>

                {/* Main Dynamic Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  <span>{activeSlide.titleLight}</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                    {activeSlide.titleGold}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-[#9CA3AF] max-w-xl leading-relaxed">
                  {activeSlide.subtitle}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={activeSlide.ctaHref}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold px-7 py-3 text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 hover:-translate-y-0.5 transition-all"
                  >
                    <span>{activeSlide.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => router.push(`/products/${activeSlide.featuredSlug}`)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 text-sm border border-white/10 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Watch Video</span>
                  </button>
                </div>
              </div>

              {/* Right Column: 3D Pedestal Product Showcase */}
              <div className="lg:col-span-5 flex justify-center items-center relative">
                <div className="relative w-full max-w-md aspect-square rounded-2xl flex items-center justify-center p-4">
                  {/* Glowing Pedestal Disc */}
                  <div className="absolute bottom-4 w-64 h-16 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 rounded-full blur-xl" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.titleLight}
                    className="relative z-10 max-h-80 w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Slider Navigation Arrows */}
            <button
              type="button"
              onClick={() =>
                setSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
              }
              aria-label="Previous Slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Next Slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === slideIndex ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. CATEGORY DISCOVERY CARDS (6 Crisp White Rounded Cards) */}
      {/* ==================================================================== */}
      <section className="px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {CATEGORY_CARDS.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl bg-white border border-[#E5E7EB] p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden mb-3 bg-[#F9FAFB] flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-[#111827] group-hover:text-amber-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-[#6B7280] font-medium mt-0.5">
                  {cat.discount}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Navigation Arrow Pill */}
          <Link
            href="/products"
            aria-label="View more categories"
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border border-[#D1D5DB] shadow-md items-center justify-center text-[#374151] hover:bg-amber-400 hover:text-black transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. DUAL PROMO GRID (Flash Deal Left + New Arrivals Living Room Right) */}
      {/* ==================================================================== */}
      <section className="px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Promo Card: Flash Deal (Dark Gaming Theme) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl text-white">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs tracking-wide">
                <span>Flash Deal</span>
                <Zap className="h-3.5 w-3.5 fill-amber-400" />
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-2">
                {[
                  { val: String(countdown.days).padStart(2, '0'), label: 'Days' },
                  { val: String(countdown.hours).padStart(2, '0'), label: 'Hours' },
                  { val: String(countdown.minutes).padStart(2, '0'), label: 'Mins' },
                  { val: String(countdown.seconds).padStart(2, '0'), label: 'Secs' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#1F1F24] border border-[#2E2E35] text-center"
                  >
                    <span className="text-base font-black text-white leading-none">
                      {item.val}
                    </span>
                    <span className="text-[8px] text-[#9CA3AF] uppercase font-semibold mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Up to <span className="text-amber-400">70% OFF</span>
                </h3>
                <p className="text-xs text-[#9CA3AF] font-medium mt-1">Limited Time Only</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/products?deals=true"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-950 px-6 py-2.5 font-bold text-xs hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* PlayStation 5 console product image */}
            <div className="relative mt-4 flex justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80"
                alt="Flash Deal Console"
                className="max-h-48 object-contain rounded-xl opacity-90 drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right Promo Card: New Arrivals (Warm Interior Furniture Theme) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#EFECE6] border border-[#E2DDD5] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-sm space-y-3">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                New Arrivals
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-[#111827] tracking-tight leading-tight">
                Smart Choices.
                <br />
                Better Living.
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                Discover our latest collection with premium quality craftsmanship.
              </p>
              <div className="pt-3">
                <Link
                  href="/products?category=office-furniture"
                  className="inline-flex items-center gap-2 rounded-full bg-[#111827] text-white px-6 py-2.5 font-bold text-xs hover:bg-black transition-colors"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Living room furniture aesthetic photo */}
            <div className="relative mt-4 flex justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=650&q=80"
                alt="Modern Living Armchair"
                className="max-h-60 object-contain rounded-2xl drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. TRENDING PRODUCTS (5-Column Grid with Badges & Add to Cart) */}
      {/* ==================================================================== */}
      <section className="px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Section Header with Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <span className="h-0.5 w-5 bg-amber-500 inline-block" />
                <span>Trending Products</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight mt-1">
                Most popular items this week
              </h2>
            </div>

            {/* Filter Tabs & Arrows */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {[
                { key: 'popular', label: 'Popular' },
                { key: 'best', label: 'Best Selling' },
                { key: 'rated', label: 'Top Rated' },
                { key: 'new', label: 'New Arrivals' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTrendingTab(tab.key as any)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    trendingTab === tab.key
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <div className="flex items-center gap-1 pl-2">
                <button
                  type="button"
                  aria-label="Previous Page"
                  className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:text-black hover:border-black cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next Page"
                  className="h-8 w-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:text-black hover:border-black cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 5-Column Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TRENDING_PRODUCTS.map((prod) => {
              const inWish = isInWishlist(prod.id);
              return (
                <div
                  key={prod.id}
                  className="group rounded-2xl bg-white border border-[#E5E7EB] p-4 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all"
                >
                  {/* Card Top: Discount Pill & Wishlist Button */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-full bg-rose-500 text-white font-black text-[10px] px-2 py-0.5">
                        {prod.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(prod)}
                        aria-label="Toggle Wishlist"
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          inWish
                            ? 'bg-rose-50 text-rose-500'
                            : 'bg-[#F3F4F6] text-[#9CA3AF] hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${inWish ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Product Image */}
                    <Link
                      href={`/products/${prod.slug}`}
                      className="block aspect-square w-full rounded-xl overflow-hidden bg-[#F9FAFB] p-3 flex items-center justify-center mb-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Meta */}
                    <div className="space-y-1">
                      <Link
                        href={`/products/${prod.slug}`}
                        className="font-bold text-xs sm:text-sm text-[#111827] hover:text-amber-600 line-clamp-1"
                      >
                        {prod.title}
                      </Link>
                      <div className="text-[11px] text-[#6B7280] font-medium">{prod.category}</div>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 pt-1 text-xs">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-[#111827]">{prod.rating}</span>
                        <span className="text-[#9CA3AF] text-[10px]">({prod.reviews})</span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-black text-sm sm:text-base text-[#111827]">
                          ${prod.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#9CA3AF] line-through font-medium">
                          ${prod.originalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod)}
                      className="w-full rounded-full bg-[#111827] hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs py-2.5 transition-colors cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. TRUSTED BRANDS & WORLDWIDE SERVICE STRIP */}
      {/* ==================================================================== */}
      <section className="px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto rounded-3xl bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Brand Showcase */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <span className="h-0.5 w-5 bg-amber-500 inline-block" />
                <span>Trusted by Millions Worldwide</span>
              </div>
              <p className="text-xs text-[#6B7280]">Join over 10M+ happy global customers</p>

              {/* Brand Logos Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-1 text-[#4B5563] font-bold text-sm">
                <span className="tracking-tighter text-lg font-black text-black"> Apple</span>
                <span className="tracking-wider uppercase font-black">Samsung</span>
                <span className="tracking-tight italic uppercase font-black">Nike</span>
                <span className="tracking-wider font-extrabold">adidas</span>
                <span className="tracking-widest font-black uppercase">SONY</span>
                <span className="tracking-wider font-black">DELL</span>
                <span className="tracking-tight font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-sm text-xs">
                  mi
                </span>
              </div>
            </div>

            {/* Right Worldwide Service Guarantees */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-6 lg:pt-0 lg:pl-8 text-left">
              <div className="space-y-1">
                <Truck className="h-5 w-5 text-[#111827]" />
                <div className="text-xs font-bold text-[#111827]">Free Shipping</div>
                <div className="text-[10px] text-[#6B7280]">Worldwide</div>
              </div>

              <div className="space-y-1">
                <ShieldCheck className="h-5 w-5 text-[#111827]" />
                <div className="text-xs font-bold text-[#111827]">Secure Payment</div>
                <div className="text-[10px] text-[#6B7280]">100% Secure</div>
              </div>

              <div className="space-y-1">
                <Headphones className="h-5 w-5 text-[#111827]" />
                <div className="text-xs font-bold text-[#111827]">24/7 Support</div>
                <div className="text-[10px] text-[#6B7280]">Always Here</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. THREE-COLUMN FEATURE CARDS (Aureon Prime, AI, App Download) */}
      {/* ==================================================================== */}
      <section className="px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Exclusive Member Benefits (Gold Crown) */}
          <div className="rounded-3xl bg-[#141416] border border-[#27272A] p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <h3 className="font-black text-lg text-white">Exclusive Member Benefits</h3>
              <p className="text-xs text-[#9CA3AF]">Get more with Aureon Prime</p>

              <div className="space-y-2 pt-2 text-xs font-medium">
                <div className="flex items-center gap-2 text-amber-300">
                  <Check className="h-3.5 w-3.5" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <Check className="h-3.5 w-3.5" />
                  <span>Exclusive Deals</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <Check className="h-3.5 w-3.5" />
                  <span>Early Access</span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between pt-6 relative z-10">
              <Link
                href="/account/settings"
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 hover:bg-amber-300 transition-colors"
              >
                <span>Join Prime</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Crown className="h-14 w-14 text-amber-400/80 drop-shadow-lg" />
            </div>
          </div>

          {/* Card 2: Shop Smarter with AI (Robot Assistant) */}
          <div className="rounded-3xl bg-[#1E1B2E] border border-[#352D4F] p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <h3 className="font-black text-lg text-white">Shop Smarter with AI</h3>
              <p className="text-xs text-[#A5B4FC]">
                Get personalized recommendations powered by AI.
              </p>
            </div>

            <div className="flex items-end justify-between pt-8 relative z-10">
              <button
                type="button"
                onClick={openAIAssistant}
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-950 font-bold text-xs px-5 py-2.5 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <span>Try AI Shopping</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <Bot className="h-14 w-14 text-purple-300 drop-shadow-lg" />
            </div>
          </div>

          {/* Card 3: Download Our App (Mobile Phone) */}
          <div className="rounded-3xl bg-[#101014] border border-[#27272A] p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <h3 className="font-black text-lg text-white">Download Our App</h3>
              <p className="text-xs text-[#9CA3AF]">Shop anytime, anywhere.</p>
            </div>

            <div className="flex items-end justify-between pt-8 relative z-10">
              <div className="space-y-2">
                <div className="rounded-lg bg-black/60 border border-white/20 px-3 py-1.5 text-[10px] font-bold cursor-pointer hover:border-amber-400">
                  Download on the App Store
                </div>
                <div className="rounded-lg bg-black/60 border border-white/20 px-3 py-1.5 text-[10px] font-bold cursor-pointer hover:border-amber-400">
                  GET IT ON Google Play
                </div>
              </div>
              <Smartphone className="h-14 w-14 text-slate-300 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 10. WORLD-CLASS DARK LUXURY FOOTER */}
      {/* ==================================================================== */}
      <footer className="bg-[#0B0B0C] border-t border-[#1F1F24] text-white pt-16 pb-12 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Footer Links Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="space-y-4 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-400 flex items-center justify-center font-black text-slate-950 text-sm">
                  ▲
                </div>
                <span className="text-xl font-black text-white tracking-tight">Aureon</span>
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Shop Better. Live Smarter. Global multi-vendor marketplace connecting verified sellers
                with millions of customers worldwide.
              </p>
              <div className="flex items-center gap-3 pt-2 text-[#9CA3AF]">
                <span className="h-8 w-8 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center hover:text-white cursor-pointer text-xs">
                  f
                </span>
                <span className="h-8 w-8 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center hover:text-white cursor-pointer text-xs">
                  𝕏
                </span>
                <span className="h-8 w-8 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center hover:text-white cursor-pointer text-xs">
                  ▶
                </span>
                <span className="h-8 w-8 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center hover:text-white cursor-pointer text-xs">
                  in
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Quick Links</h4>
              <ul className="space-y-2 text-xs text-[#9CA3AF]">
                <li>
                  <Link href="/" className="hover:text-amber-400">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-amber-400">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-amber-400">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/products?deals=true" className="hover:text-amber-400">
                    Flash Sale
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-amber-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                Customer Service
              </h4>
              <ul className="space-y-2 text-xs text-[#9CA3AF]">
                <li>
                  <Link href="/help" className="hover:text-amber-400">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="hover:text-amber-400">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-amber-400">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-amber-400">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-amber-400">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* About Aureon */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">About Aureon</h4>
              <ul className="space-y-2 text-xs text-[#9CA3AF]">
                <li>
                  <Link href="/about" className="hover:text-amber-400">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-amber-400">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-amber-400">
                    Press & News
                  </Link>
                </li>
                <li>
                  <Link href="/affiliate" className="hover:text-amber-400">
                    Affiliate Program
                  </Link>
                </li>
                <li>
                  <Link href="/seller/register" className="hover:text-amber-400">
                    Become a Seller
                  </Link>
                </li>
              </ul>
            </div>

            {/* Stay Connected (Newsletter) */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                Stay Connected
              </h4>
              <p className="text-xs text-[#9CA3AF]">
                Subscribe to our newsletter for updates and exclusive offers.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerToast('Thank you for subscribing to our newsletter!');
                }}
                className="flex items-center rounded-xl bg-[#18181B] border border-[#27272A] p-1 focus-within:border-amber-400"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="bg-transparent px-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center hover:bg-amber-300 shrink-0 cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Copyright and Localization Bar */}
          <div className="border-t border-[#1F1F24] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
            <div>© 2026 Aureon. All rights reserved.</div>

            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white">
                Cookie Settings
              </Link>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                <span>🌐</span>
                <span>English</span>
                <ChevronDown className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                <span>USD</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
