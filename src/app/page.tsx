'use client';

/**
 * ==============================================================================
 * ENTERPRISE MULTI-VENDOR MARKETPLACE — HOMEPAGE
 * ==============================================================================
 * Production customer-facing marketplace homepage.
 * Pure Light Theme aesthetic with smooth pill navigation, soft pastel trust cards,
 * crisp rounded-3xl product cards, responsive flash deal timer, verified merchant
 * storefront showcase, and AI recommendations.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Laptop,
  Headphones,
  Monitor,
  Footprints,
  Armchair,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headset,
  Sparkles,
  Flame,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Store,
  CheckCircle2,
  Award,
  Layers,
  ShoppingBag,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';

import { AppShell } from '@/components/layout/shell/app-shell';
import { Container, Section } from '@/components/layout/container/container';
import { Button } from '@/components/ui/button/button';
import { Badge } from '@/components/ui/badge/badge';
import { ProductCard } from '@/components/product-card/product-card';
import { AIRecommendationsRow } from '@/features/ai/recommendations/ai-recommendations-row';
import { RecentlyViewedSection } from '@/features/recently-viewed/components/recently-viewed-section';
import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { useI18n } from '@/lib/i18n';
import { MOCK_PRODUCTS, MOCK_SELLERS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';
import type { Product } from '@/domains/catalog/types/product';
import type { AddToCartInput } from '@/domains/cart/types/cart';

// Hero promotional slides data (Light Theme)
interface HeroSlide {
  id: string;
  badge: string;
  badgeVariant: 'brand' | 'destructive' | 'info' | 'neutral';
  title: string;
  subtitle: string;
  priceHeadline: string;
  compareAt?: string;
  productSlug: string;
  ctaText: string;
  secondaryCtaText: string;
  secondaryHref: string;
  features: string[];
  gradientClass: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-mbp-16',
    badge: 'FLAGSHIP RELEASE',
    badgeVariant: 'brand',
    title: 'Apple MacBook Pro 16″ M3 Max',
    subtitle:
      'Massive speed and extreme capability for demanding professional workflows. Featuring Liquid Retina XDR display and up to 22 hours of battery life.',
    priceHeadline: 'From $3,499.00',
    compareAt: '$3,999.00',
    productSlug: 'apple-macbook-pro-16-m3-max',
    ctaText: 'Shop MacBook Pro',
    secondaryCtaText: 'View 4 Seller Offers',
    secondaryHref: '/products/apple-macbook-pro-16-m3-max',
    features: ['M3 Max 16-Core CPU', '40-Core GPU', 'Liquid Retina XDR', 'Up to 22h Battery Life'],
    gradientClass: 'from-indigo-50/80 via-white to-purple-50/60',
    accentColor: 'text-indigo-600',
    icon: Laptop,
    image: '/assets/mock/products/mbp16-hero.webp',
  },
  {
    id: 'hero-sony-xm5',
    badge: 'LIMITED TIME DEAL • 15% OFF',
    badgeVariant: 'destructive',
    title: 'Sony WH-1000XM5 Noise Canceling',
    subtitle:
      'Industry-leading active noise cancellation with dual processors, 8 microphones, and ultra-lightweight comfortable design.',
    priceHeadline: 'Special Deal $398.00',
    compareAt: '$469.00',
    productSlug: 'sony-wh-1000xm5-wireless-headphones',
    ctaText: 'Claim Audio Deal',
    secondaryCtaText: 'Explore All Audio',
    secondaryHref: '/products?category=audio-headphones',
    features: [
      'Auto NC Optimizer',
      '30-Hour Battery Life',
      'Hi-Res Wireless Audio',
      'Crystal Clear Calls',
    ],
    gradientClass: 'from-amber-50/80 via-white to-orange-50/50',
    accentColor: 'text-amber-600',
    icon: Headphones,
    image: '/assets/mock/products/sony-xm5-hero.webp',
  },
  {
    id: 'hero-samsung-g9',
    badge: 'ULTRAWIDE GAMING',
    badgeVariant: 'info',
    title: 'Samsung Odyssey OLED G9 49″',
    subtitle:
      'Dual QHD curved display with 240Hz refresh rate and 0.03ms response time for unprecedented immersion and fluid competitive gaming.',
    priceHeadline: '$1,799.99',
    compareAt: '$2,199.99',
    productSlug: 'samsung-odyssey-oled-g9-49',
    ctaText: 'Discover Gaming Monitor',
    secondaryCtaText: 'All Displays',
    secondaryHref: '/products?category=monitors-displays',
    features: [
      'Dual QHD 5120x1440',
      '240Hz OLED / 0.03ms',
      '1800R Curvature',
      'Neo Quantum Processor',
    ],
    gradientClass: 'from-cyan-50/80 via-white to-blue-50/60',
    accentColor: 'text-cyan-600',
    icon: Monitor,
    image: '/assets/mock/products/samsung-neo-g9.webp',
  },
];

// Featured categories mapping
const FEATURED_CATEGORIES = [
  {
    id: 'cat-computers-laptops',
    slug: 'computers-laptops',
    name: 'Computers & Laptops',
    count: '650+ Products',
    icon: Laptop,
    accentBg: 'bg-blue-500/10 text-blue-600',
    image: '/assets/mock/products/mbp16-hero.webp',
  },
  {
    id: 'cat-audio-headphones',
    slug: 'audio-headphones',
    name: 'Audio & Headphones',
    count: '380+ Products',
    icon: Headphones,
    accentBg: 'bg-purple-500/10 text-purple-600',
    image: '/assets/mock/products/sony-xm5-hero.webp',
  },
  {
    id: 'cat-monitors-displays',
    slug: 'monitors-displays',
    name: 'Curved Displays',
    count: '140+ Products',
    icon: Monitor,
    accentBg: 'bg-cyan-500/10 text-cyan-600',
    image: '/assets/mock/products/samsung-neo-g9.webp',
  },
  {
    id: 'cat-mens-footwear',
    slug: 'mens-footwear',
    name: 'Athletic Footwear',
    count: '280+ Products',
    icon: Footprints,
    accentBg: 'bg-rose-500/10 text-rose-600',
    image: '/assets/mock/products/nike-alphafly-3-hero.webp',
  },
  {
    id: 'cat-office-furniture',
    slug: 'office-furniture',
    name: 'Office Furniture',
    count: '190+ Products',
    icon: Armchair,
    accentBg: 'bg-emerald-500/10 text-emerald-600',
    image: '/assets/mock/products/herman-miller-aeron.webp',
  },
  {
    id: 'cat-mobile-accessories',
    slug: 'mobile-accessories',
    name: 'Power & Accessories',
    count: '290+ Products',
    icon: Zap,
    accentBg: 'bg-amber-500/10 text-amber-600',
    image: '/assets/mock/products/anker-737.webp',
  },
];

export default function HomePage(): React.JSX.Element {
  const { locale } = useI18n();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Active hero carousel state
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState<boolean>(false);

  // Trending filter tab state
  const [activeTrendingTab, setActiveTrendingTab] = useState<
    'all' | 'electronics' | 'footwear' | 'office'
  >('all');

  // Flash sale countdown simulation
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  // Action feedback banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Carousel auto-advance timer
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Flash sale countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Add to Cart handler
  const handleQuickAddToCart = useCallback(
    (product: Product) => {
      const winningOffer =
        MOCK_SELLER_OFFERS.find((o) => o.productId === product.id && o.isBuyBoxWinner) ||
        MOCK_SELLER_OFFERS.find((o) => o.productId === product.id);

      const cartInput: AddToCartInput = {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        imageUrl: product.media[0]?.url,
        offerId: winningOffer ? winningOffer.offerId : `offer-${product.id}`,
        sellerId: winningOffer ? winningOffer.sellerId : 'seller-tech-direct',
        sellerName: winningOffer ? winningOffer.seller.name : 'TechDirect Express',
        unitPrice: winningOffer ? winningOffer.price : product.offerSummary.lowestPrice,
        quantity: 1,
      };

      const added = addItem(cartInput);
      if (added) {
        const titleText = (locale && product.title[locale]) || product.title.en;
        showToast(`Added "${titleText}" to your shopping cart.`);
      }
    },
    [addItem, locale, showToast]
  );

  // Filter trending products by category tab
  const filteredTrendingProducts = useMemo(() => {
    if (activeTrendingTab === 'all') return MOCK_PRODUCTS;
    if (activeTrendingTab === 'electronics') {
      return MOCK_PRODUCTS.filter((p) => p.categoryPath.includes('electronics'));
    }
    if (activeTrendingTab === 'footwear') {
      return MOCK_PRODUCTS.filter((p) => p.categoryId.includes('footwear'));
    }
    if (activeTrendingTab === 'office') {
      return MOCK_PRODUCTS.filter(
        (p) => p.categoryPath.includes('office') || p.categoryPath.includes('furniture')
      );
    }
    return MOCK_PRODUCTS;
  }, [activeTrendingTab]);

  // Flash deal products subset
  const flashSaleProducts = useMemo(() => {
    return MOCK_PRODUCTS.slice(1, 4); // Sony XM5, Nike Alphafly, Herman Miller
  }, []);

  const activeSlide = HERO_SLIDES[currentSlideIndex] ?? HERO_SLIDES[0]!;

  return (
    <AppShell className="bg-[#F6F8FB]">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-primary/20 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md text-sm font-semibold text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 0. HORIZONTAL PILL CATEGORY BAR (Matching Reference Image 1) */}
      <section className="border-b border-slate-200/70 bg-white py-2.5 shadow-2xs">
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <Link
              href="/products"
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-xs shrink-0 hover:bg-primary-hover transition-all"
            >
              All Categories
            </Link>
            <Link
              href="/products?deals=true"
              className="rounded-full border border-slate-200/80 bg-slate-50/70 px-4 py-1.5 text-xs font-semibold text-slate-700 shrink-0 hover:bg-white hover:border-slate-300 transition-all flex items-center gap-1.5"
            >
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              Deals
            </Link>
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shrink-0 hover:border-primary/40 hover:text-primary transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <cat.icon className="h-3.5 w-3.5 text-slate-400" />
                {cat.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 1. HERO SECTION (Pure Light Theme Promotional Carousel) */}
      <section
        aria-label="Promotional Carousel"
        className="relative overflow-hidden py-4 sm:py-6"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
      >
        <Container>
          <div
            className={`relative w-full rounded-3xl border border-slate-200/80 bg-gradient-to-br ${activeSlide.gradientClass} p-6 sm:p-10 lg:p-12 shadow-sm transition-all duration-700`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Slide Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-bold tracking-wide uppercase text-xs">
                    {activeSlide.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Verified Marketplace Guarantee
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                    {activeSlide.title}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {/* Price & Features */}
                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {activeSlide.priceHeadline}
                  </span>
                  {activeSlide.compareAt && (
                    <span className="text-lg text-slate-400 line-through font-medium">
                      {activeSlide.compareAt}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
                    Multiple Sellers In Stock
                  </span>
                </div>

                {/* Bullet Points */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
                  {activeSlide.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Call to Actions (Smooth Rounded Pills) */}
                <div className="flex flex-wrap items-center gap-3.5 pt-3">
                  <Button
                    asChild
                    size="lg"
                    variant="primary"
                    className="rounded-full px-7 font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <Link href={`/products/${activeSlide.productSlug}`}>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      {activeSlide.ctaText}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="tertiary"
                    className="rounded-full px-6 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-xs"
                  >
                    <Link href={activeSlide.secondaryHref}>
                      {activeSlide.secondaryCtaText}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Slide Visual Feature Card (Pure White Glass Card) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md rounded-3xl border border-slate-200/90 bg-white/95 p-5 backdrop-blur-xl shadow-xl space-y-4">
                  {/* Real Product Photography Feature */}
                  <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 border border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      className="h-full w-full object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
                    />
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-slate-800 border border-slate-200/80 shadow-2xs">
                      {activeSlide.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Featured Flagship
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                        {activeSlide.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      4.9 / 5.0
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">TechDirect Express</div>
                      <div className="text-[11px] text-slate-500">
                        Authorized Distributor • Same-Day Dispatch
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px] font-bold rounded-full">
                      Top Rated
                    </Badge>
                  </div>

                  <div className="rounded-2xl bg-white p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carrier Tracking:</span>
                      <span className="font-semibold text-slate-800">Express Air (2-3 Days)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Protection:</span>
                      <span className="font-semibold text-emerald-600">Escrow Secured</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="secondary"
                    className="w-full rounded-full font-bold text-slate-800 bg-slate-100 hover:bg-slate-200"
                  >
                    <Link href={`/products/${activeSlide.productSlug}`}>
                      View Product Specifications
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Carousel Controls (Dots & Navigation) */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200/60 pt-4">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentSlideIndex === idx
                        ? 'w-8 bg-primary'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                    aria-current={currentSlideIndex === idx}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlideIndex(
                      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </Container>

        {/* 2. VALUE PROPOSITION RIBBON (Pastel Trust Cards matching Reference Image 3) */}
        <div className="pt-6">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-sky-50/70 border border-sky-100 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-sky-950">Free Express Shipping</div>
                  <div className="text-xs text-sky-700/80">Complimentary on orders over $150</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-emerald-50/70 border border-emerald-100 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-950">100% Authentic Guarantee</div>
                  <div className="text-xs text-emerald-700/80">Direct from certified distributors</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-purple-50/70 border border-purple-100 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-purple-950">30-Day Hassle-Free Returns</div>
                  <div className="text-xs text-purple-700/80">
                    Prepaid shipping labels & instant refunds
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-amber-50/70 border border-amber-100 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                  <Headset className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-950">24/7 Verified Support</div>
                  <div className="text-xs text-amber-700/80">Dedicated multi-vendor assistance</div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES SHOWCASE (Smooth Rounded Cards) */}
      <Section spacing="md">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Layers className="h-4 w-4" />
                Marketplace Catalog
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Browse by Category
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Explore thousands of authenticated products across top verified departments
              </p>
            </div>
            <Button asChild variant="tertiary" size="sm" className="rounded-full shadow-2xs">
              <Link href="/products">
                View All Categories
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 text-left"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50/80 flex items-center justify-center p-3 mb-3 border border-slate-100/80 group-hover:bg-slate-100/60 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-lg ${cat.accentBg} backdrop-blur-md shadow-xs`}
                    >
                      <cat.icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Shop Now
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. FLASH DEALS & LIMITED-TIME OFFERS SHELF */}
      <Section spacing="md" className="bg-slate-50/80 border-y border-slate-200/60">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    Flash Deals & Daily Steals
                  </h2>
                  <span className="rounded-full bg-rose-500 text-white px-2.5 py-0.5 font-bold text-2xs uppercase tracking-wider animate-pulse">
                    Hot Deals
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Limited quantities available at discounted rates from verified merchants
                </p>
              </div>
            </div>

            {/* Countdown Timer (Smooth Pill Tags matching Reference Image 3) */}
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 px-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Ends In:</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800">
                <span className="rounded-md bg-slate-100 px-2 py-0.5">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-rose-600">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashSaleProducts.map((prod, idx) => (
              <ProductCard
                key={prod.id}
                product={prod}
                variant="flash-sale"
                flashSaleProgressPercent={75 - idx * 15}
                isWishlisted={isInWishlist(prod.id)}
                onWishlistToggle={() => toggleWishlist(prod)}
                onQuickAction={() => handleQuickAddToCart(prod)}
                quickActionLabel="Add to Cart"
                showQuickAction
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* 5. TRENDING & TOP-SELLING PRODUCTS (Multi-Vendor Grid) */}
      <Section spacing="md">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <TrendingUp className="h-4 w-4" />
                Customer Favorites
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Trending Marketplace Selections
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Best-selling products backed by multiple competitive vendor offers
              </p>
            </div>

            {/* Filter Tabs (Smooth Pills matching Reference Image 1) */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200/80 p-1 bg-white shadow-xs">
              {(
                [
                  { id: 'all', label: 'All Products' },
                  { id: 'electronics', label: 'Electronics' },
                  { id: 'footwear', label: 'Footwear' },
                  { id: 'office', label: 'Office Setup' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTrendingTab(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    activeTrendingTab === tab.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTrendingProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="standard"
                isWishlisted={isInWishlist(product.id)}
                onWishlistToggle={() => toggleWishlist(product)}
                onQuickAction={() => handleQuickAddToCart(product)}
                quickActionLabel="Quick Add"
                showQuickAction
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. FEATURED MULTI-VENDOR STORES SHOWCASE */}
      <Section spacing="md" className="bg-slate-50/70 border-y border-slate-200/60">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <Award className="h-4 w-4" />
                Verified Merchant Network
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Featured Brand Stores & Merchants
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Shop directly from authorized distributors, flagship stores, and certified sellers
              </p>
            </div>
            <Button asChild variant="tertiary" size="sm" className="rounded-full shadow-2xs">
              <Link href="/seller/register">
                Become a Seller
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_SELLERS.map((seller) => (
              <div
                key={seller.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={seller.logoUrl}
                        alt={seller.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {seller.isVerified && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors">
                      {seller.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        {seller.rating.average.toFixed(1)}
                      </div>
                      <span>•</span>
                      <span>{seller.rating.count.toLocaleString()} reviews</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {seller.badges.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 capitalize"
                      >
                        {b.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Positive Feedback:</span>
                      <span className="font-bold text-slate-800">
                        {seller.rating.positiveFeedbackPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fulfillment:</span>
                      <span className="font-bold text-slate-800">Insured Express</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-full font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
                  >
                    <Link href={`/store/${seller.slug}`}>
                      Visit Storefront
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 7. AI RECOMMENDATIONS & RECENTLY VIEWED SHELF */}
      <Section spacing="md">
        <Container className="space-y-8">
          <AIRecommendationsRow
            productId="prod-macbook-pro-16"
            title="AI-Curated Recommendations For You"
            limit={4}
          />
          <RecentlyViewedSection />
        </Container>
      </Section>

      {/* 8. MARKETPLACE TRUST & BUYER PROTECTION DETAILS */}
      <Section spacing="lg" className="border-t border-slate-200/60 bg-white">
        <Container>
          <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 p-8 sm:p-12 shadow-sm">
            <div className="max-w-3xl space-y-3">
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-bold uppercase text-2xs tracking-wider inline-block">
                Enterprise Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Why Millions Trust Our Global Multi-Vendor Platform
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We connect certified independent merchants with discerning shoppers, providing
                strict quality moderation, competitive multi-offer pricing, and end-to-end
                transaction security.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/60">
              <div className="space-y-2">
                <div className="text-primary font-bold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Buyer Protection Escrow
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Payments are held securely in escrow until order delivery and verification,
                  eliminating counterfeit risk and non-fulfillment.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-primary font-bold text-sm flex items-center gap-1.5">
                  <Store className="h-4 w-4" />
                  Vetted Merchant Registry
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every merchant undergoes business license verification, tax ID validation, and
                  ongoing fulfillment metric audits before listing.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-primary font-bold text-sm flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  Universal Return Policy
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Standardized 30-day return policy across all merchants with automated prepaid
                  shipping labels and instant refund processing.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}
