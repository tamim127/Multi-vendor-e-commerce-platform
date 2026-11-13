'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Play,
  Check,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Sparkles,
  Bot,
  Crown,
  Smartphone,
  Store,
  CheckCircle2,
} from 'lucide-react';

import { AppShell } from '@/components/layout/shell/app-shell';
import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
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

// Featured Category Discovery Cards
const CATEGORY_CARDS = [
  {
    id: 'cat-laptops',
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    discount: 'Up to 60% Off',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-audio',
    name: 'Audio & Headphones',
    slug: 'audio-headphones',
    discount: 'Up to 50% Off',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-monitors',
    name: 'Curved Displays',
    slug: 'monitors-displays',
    discount: 'Up to 45% Off',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-fashion',
    name: 'Luxury Fashion',
    slug: 'mens-clothing',
    discount: 'Up to 50% Off',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    slug: 'office-furniture',
    discount: 'Up to 60% Off',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Health',
    slug: 'beauty-wellness',
    discount: 'Up to 50% Off',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80',
  },
];

// Curated Trending Products Data
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

function getTrendingProductsForTab(tab: 'popular' | 'best' | 'rated' | 'new'): CuratedTrendingProduct[] {
  let pool = [...MOCK_PRODUCTS];
  if (tab === 'best') {
    pool = pool.filter((p) => p.badges.some((b) => b.type === 'best_seller'));
  } else if (tab === 'rated') {
    pool = pool.filter((p) => p.ratingSummary.average >= 4.7);
  } else if (tab === 'new') {
    pool = pool.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // popular
    pool = pool.sort((a, b) => b.ratingSummary.count - a.ratingSummary.count);
  }

  return pool.slice(0, 5).map((p) => {
    const price = (p.offerSummary?.lowestPrice?.amountMinor || 19900) / 100;
    const highestPriceMinor = p.offerSummary?.highestPrice?.amountMinor || (p.offerSummary?.lowestPrice?.amountMinor || 19900) * 1.25;
    const originalPrice = Math.round(highestPriceMinor / 100);
    const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 20;
    const reviewCount = p.ratingSummary.count >= 1000 ? `${(p.ratingSummary.count / 1000).toFixed(1)}k` : `${p.ratingSummary.count}`;
    const img = p.media[0]?.url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80';
    return {
      id: p.id,
      slug: p.slug,
      title: p.title.en,
      category: p.categoryBreadcrumbs[p.categoryBreadcrumbs.length - 1]?.name.en || p.brand.name,
      badge: `-${discountPercent}%`,
      rating: p.ratingSummary.average,
      reviews: reviewCount,
      price,
      originalPrice,
      image: img,
    };
  });
}

// Featured Merchants
const FEATURED_MERCHANTS = [
  {
    id: 'seller-official-flagship',
    slug: 'official-flagship-store',
    name: 'Official Flagship Store',
    category: 'Direct Brand Flagship',
    rating: '4.9',
    orders: '14.2k',
    badge: 'Direct Brand',
  },
  {
    id: 'seller-tech-direct',
    slug: 'tech-direct-express',
    name: 'TechDirect Express',
    category: 'Consumer Electronics & Computing',
    rating: '4.8',
    orders: '8.9k',
    badge: 'Top Rated',
  },
  {
    id: 'seller-global-ware',
    slug: 'global-ware-imports',
    name: 'GlobalWare Imports',
    category: 'International Lifestyle & Living',
    rating: '4.6',
    orders: '4.2k',
    badge: 'Authorized',
  },
  {
    id: 'seller-apex-outlet',
    slug: 'apex-outlet-deals',
    name: 'Apex Outlet Deals',
    category: 'Clearance & Certified Refurbished',
    rating: '4.5',
    orders: '3.1k',
    badge: 'Verified Deal',
  },
];

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toggleOpen: openAIAssistant } = useAIAssistant();

  // Hero Carousel State
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Trending filter tabs
  const [trendingTab, setTrendingTab] = useState<'popular' | 'best' | 'rated' | 'new'>('popular');
  const visibleTrendingProducts = useMemo(() => getTrendingProductsForTab(trendingTab), [trendingTab]);

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

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carousel autoplay effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

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
    <AppShell>
      <div className="bg-canvas text-fg-primary min-h-screen transition-colors duration-200">
        {/* Toast Notification */}
        {toast && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-slate-900/95 text-white dark:bg-[#0B0B0C]/95 px-5 py-3.5 shadow-2xl backdrop-blur-md text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span>{toast}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 1. HERO PROMOTIONAL CAROUSEL (Cinematic Dark & Warm Gold Experience) */}
        {/* ==================================================================== */}
        <section
          aria-label="Promotional Carousel"
          className="px-4 sm:px-8 py-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="max-w-7xl mx-auto space-y-4">
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
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
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

                  {/* Verified Marketplace Guarantee Tag */}
                  <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verified Marketplace Guarantee</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
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
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 border border-white/15 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all backdrop-blur-md cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                aria-label="Next slide"
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

            {/* Value Proposition Trust Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border-default shadow-xs">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500 dark:text-amber-400 border border-amber-400/30 shrink-0">
                  <Truck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-fg-primary">Free Express Shipping</h4>
                  <p className="text-[11px] text-fg-secondary">Orders over $50</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border-default shadow-xs">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500 dark:text-amber-400 border border-amber-400/30 shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-fg-primary">100% Authentic Guarantee</h4>
                  <p className="text-[11px] text-fg-secondary">KYC-verified merchants</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border-default shadow-xs">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500 dark:text-amber-400 border border-amber-400/30 shrink-0">
                  <RotateCcw className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-fg-primary">30-Day Hassle-Free Returns</h4>
                  <p className="text-[11px] text-fg-secondary">Instant escrow refunds</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border-default shadow-xs">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500 dark:text-amber-400 border border-amber-400/30 shrink-0">
                  <Headphones className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-fg-primary">24/7 Verified Support</h4>
                  <p className="text-[11px] text-fg-secondary">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 2. BROWSE BY CATEGORY DISCOVERY CARDS */}
        {/* ==================================================================== */}
        <section className="px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-4 relative">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-fg-primary tracking-tight">
                  Browse by Category
                </h2>
                <p className="text-xs text-fg-secondary mt-0.5">Explore curated departments and top collections</p>
              </div>

              <Link
                href="/categories"
                className="text-xs font-bold text-amber-500 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>All Categories</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {CATEGORY_CARDS.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative rounded-2xl bg-surface border border-border-default p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden mb-3 bg-surface-muted flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-fg-primary group-hover:text-amber-500 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-fg-muted font-medium mt-0.5">
                    {cat.discount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. DUAL PROMO GRID: FLASH DEALS & NEW ARRIVALS */}
        {/* ==================================================================== */}
        <section className="px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Promo Card: Flash Deal */}
            <div className="lg:col-span-5 rounded-3xl bg-[#0F0F12] border border-[#27272A] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl text-white">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs tracking-wide">
                    <span>Flash Deal</span>
                    <Zap className="h-3.5 w-3.5 fill-amber-400" />
                  </div>
                  <span className="text-xs text-[#A1A1AA]">Ends In:</span>
                </div>

                {/* Section Heading */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Flash Deals & Daily Steals
                </h2>

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
                      <span className="text-base font-bold text-white leading-none">
                        {item.val}
                      </span>
                      <span className="text-[8px] text-[#9CA3AF] uppercase font-semibold mt-1">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
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

            {/* Right Promo Card: New Arrivals */}
            <div className="lg:col-span-7 rounded-3xl bg-surface border border-border-default p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-xs">
              <div className="relative z-10 max-w-sm space-y-3">
                <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                  New Arrivals
                </span>
                <h3 className="text-2xl sm:text-4xl font-bold text-fg-primary tracking-tight leading-tight">
                  Smart Choices.
                  <br />
                  Better Living.
                </h3>
                <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
                  Discover our latest collection with premium quality craftsmanship.
                </p>
                <div className="pt-3">
                  <Link
                    href="/products?category=office-furniture"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-6 py-2.5 font-bold text-xs hover:bg-amber-400 hover:text-slate-950 transition-colors"
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
        {/* 4. TRENDING MARKETPLACE SELECTIONS (5-Column Grid) */}
        {/* ==================================================================== */}
        <section className="px-4 sm:px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Section Header with Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                  <span className="h-0.5 w-5 bg-amber-500 inline-block" />
                  <span>Trending Marketplace Selections</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-fg-primary tracking-tight mt-1">
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
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'bg-surface border border-border-default text-fg-secondary hover:border-amber-400/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5-Column Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {visibleTrendingProducts.map((prod) => {
                const inWish = isInWishlist(prod.id);
                return (
                  <article
                    key={prod.id}
                    className="group rounded-2xl bg-surface border border-border-default p-4 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all"
                  >
                    {/* Card Top: Discount Pill & Wishlist Button */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-full bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5">
                          {prod.badge}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(prod)}
                          aria-label="Toggle Wishlist"
                          className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                            inWish
                              ? 'bg-rose-50 text-rose-500'
                              : 'bg-surface-muted text-fg-muted hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${inWish ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Product Image */}
                      <Link
                        href={`/products/${prod.slug}`}
                        className="block aspect-square w-full rounded-xl overflow-hidden bg-surface-muted p-3 flex items-center justify-center mb-3"
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
                          className="font-bold text-xs sm:text-sm text-fg-primary hover:text-amber-500 line-clamp-1 transition-colors"
                        >
                          {prod.title}
                        </Link>
                        <div className="text-[11px] text-fg-muted font-medium">{prod.category}</div>

                        {/* Ratings */}
                        <div className="flex items-center gap-1 pt-1 text-xs">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-fg-primary">{prod.rating}</span>
                          <span className="text-fg-muted text-[10px]">({prod.reviews})</span>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="font-bold text-sm sm:text-base text-fg-primary">
                            ${prod.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-fg-muted line-through font-medium">
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
                        className="w-full rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs py-2.5 transition-colors cursor-pointer shadow-xs"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 5. FEATURED BRAND STORES & MERCHANTS */}
        {/* ==================================================================== */}
        <section className="px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-fg-primary tracking-tight">
                  Featured Brand Stores & Merchants
                </h2>
                <p className="text-xs text-fg-secondary mt-0.5">
                  KYC-verified independent sellers and authorized flagship distributors
                </p>
              </div>

              <Link
                href="/stores"
                className="text-xs font-bold text-amber-500 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View All Stores</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {FEATURED_MERCHANTS.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl bg-surface border border-border-default p-5 flex flex-col justify-between shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        {m.badge}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{m.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-surface-muted flex items-center justify-center text-amber-500 font-bold border border-border-subtle group-hover:scale-105 transition-transform">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-fg-primary group-hover:text-amber-500 transition-colors">
                          {m.name}
                        </h3>
                        <p className="text-[11px] text-fg-muted">{m.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                    <span className="text-[11px] text-fg-muted">{m.orders} items fulfilled</span>
                    <Link
                      href={`/store/${m.slug}`}
                      className="text-xs font-bold text-amber-500 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>Visit Storefront</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 6. PLATFORM TRUST & AI-CURATED RECOMMENDATIONS */}
        {/* ==================================================================== */}
        <section className="px-4 sm:px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                AI-Curated Recommendations For You
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-fg-primary tracking-tight">
                Why Millions Trust Our Global Multi-Vendor Platform
              </h2>
            </div>

            {/* 3-Column Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Aureon Prime */}
              <div className="rounded-3xl bg-surface border border-border-default p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="size-12 rounded-2xl bg-amber-400/15 text-amber-500 dark:text-amber-400 border border-amber-400/30 flex items-center justify-center">
                    <Crown className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-fg-primary">Exclusive Member Benefits</h3>
                  <p className="text-xs text-fg-secondary leading-relaxed">
                    Get more with Aureon Prime. Enjoy free 1-2 day express shipping, early access to flash deals,
                    and VIP concierge support.
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href="/prime"
                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-950 font-bold px-5 py-2.5 text-xs hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all"
                  >
                    <span>Join Prime</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Shop Smarter with AI */}
              <div className="rounded-3xl bg-surface border border-border-default p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="size-12 rounded-2xl bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-fg-primary">Shop Smarter with AI</h3>
                  <p className="text-xs text-fg-secondary leading-relaxed">
                    Personalized recommendations, multi-vendor cart optimization, and instant product comparisons
                    powered by state-of-the-art AI.
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={openAIAssistant}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold px-5 py-2.5 text-xs hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer"
                  >
                    <span>Try AI Shopping</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Mobile App */}
              <div className="rounded-3xl bg-surface border border-border-default p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="size-12 rounded-2xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-fg-primary">Download Our Mobile App</h3>
                  <p className="text-xs text-fg-secondary leading-relaxed">
                    Track shipments in real-time, receive instant price drop alerts, and checkout with Apple Pay &
                    Google Pay anywhere, anytime.
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href="/help"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white border border-border-default font-bold px-5 py-2.5 text-xs hover:border-amber-400 transition-all"
                  >
                    <span>Get Mobile App</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Global Trusted Brands Bar */}
            <div className="rounded-2xl bg-surface border border-border-default p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-fg-primary">Official Partner Brands</span>
                <p className="text-[11px] text-fg-muted">Over 1,200 direct brand partnerships worldwide</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-fg-secondary">
                <span className="text-sm font-black text-fg-primary"> Apple</span>
                <span className="tracking-wider uppercase font-black">Samsung</span>
                <span className="tracking-tight italic uppercase font-black">Nike</span>
                <span className="tracking-wider font-extrabold">adidas</span>
                <span className="tracking-widest font-black uppercase">SONY</span>
                <span className="tracking-wider font-black">DELL</span>
                <span className="font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px]">mi</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
