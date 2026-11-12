'use client';

/**
 * ==============================================================================
 * ENTERPRISE MULTI-VENDOR MARKETPLACE — HOMEPAGE
 * ==============================================================================
 * Production customer-facing marketplace homepage.
 * Integrates global AppShell, interactive hero carousel, category navigation,
 * flash sale countdown shelf, multi-vendor trending products, certified seller
 * storefront showcase, AI recommendations, recently viewed history, and buyer
 * protection guarantees.
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

// Hero promotional slides data
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
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-mbp-16',
    badge: 'FLAGSHIP RELEASE',
    badgeVariant: 'brand',
    title: 'Apple MacBook Pro 16″ M3 Max',
    subtitle:
      'Massive speed and extreme capability for demanding workflows. Featuring Liquid Retina XDR display and up to 22 hours of battery life.',
    priceHeadline: 'From $3,499.00',
    compareAt: '$3,999.00',
    productSlug: 'apple-macbook-pro-16-m3-max',
    ctaText: 'Shop MacBook Pro',
    secondaryCtaText: 'View 4 Seller Offers',
    secondaryHref: '/products/apple-macbook-pro-16-m3-max',
    features: ['M3 Max 16-Core CPU', '40-Core GPU', 'Liquid Retina XDR', 'Up to 22h Battery'],
    gradientClass: 'from-slate-900 via-indigo-950 to-slate-900 text-white',
    accentColor: 'text-indigo-400',
    icon: Laptop,
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
      '30-Hour Battery',
      'Hi-Res Wireless Audio',
      'Crystal Clear Calls',
    ],
    gradientClass: 'from-zinc-900 via-neutral-900 to-stone-900 text-white',
    accentColor: 'text-amber-400',
    icon: Headphones,
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
    gradientClass: 'from-cyan-950 via-slate-900 to-blue-950 text-white',
    accentColor: 'text-cyan-400',
    icon: Monitor,
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
    accentBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'cat-audio-headphones',
    slug: 'audio-headphones',
    name: 'Audio & Headphones',
    count: '380+ Products',
    icon: Headphones,
    accentBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'cat-monitors-displays',
    slug: 'monitors-displays',
    name: 'Curved Displays',
    count: '140+ Products',
    icon: Monitor,
    accentBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'cat-mens-footwear',
    slug: 'mens-footwear',
    name: 'Athletic Footwear',
    count: '280+ Products',
    icon: Footprints,
    accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'cat-office-furniture',
    slug: 'office-furniture',
    name: 'Office Furniture',
    count: '190+ Products',
    icon: Armchair,
    accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'cat-mobile-accessories',
    slug: 'mobile-accessories',
    name: 'Power & Accessories',
    count: '290+ Products',
    icon: Zap,
    accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
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
    <AppShell>
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-primary/20 bg-surface-elevated/95 px-4 py-3 shadow-xl backdrop-blur-md text-sm font-medium text-fg-primary animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO SECTION (Interactive Promotional Carousel) */}
      <section
        aria-label="Promotional Carousel"
        className="relative overflow-hidden bg-canvas-subtle"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
      >
        <div
          className={`relative w-full bg-gradient-to-br ${activeSlide.gradientClass} transition-colors duration-700 ease-in-out`}
        >
          <Container className="relative py-12 md:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Slide Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={activeSlide.badgeVariant}
                    className="px-3 py-1 font-bold tracking-wide uppercase text-xs"
                  >
                    {activeSlide.badge}
                  </Badge>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Verified Marketplace Guarantee
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                    {activeSlide.title}
                  </h1>
                  <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {/* Price & Features */}
                <div className="flex flex-wrap items-baseline gap-3 pt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {activeSlide.priceHeadline}
                  </span>
                  {activeSlide.compareAt && (
                    <span className="text-lg text-white/60 line-through">
                      {activeSlide.compareAt}
                    </span>
                  )}
                  <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90">
                    Multiple Sellers Available
                  </span>
                </div>

                {/* Bullet Points */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-white/90">
                  {activeSlide.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Call to Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button asChild size="lg" variant="primary" className="font-bold shadow-lg">
                    <Link href={`/products/${activeSlide.productSlug}`}>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      {activeSlide.ctaText}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="tertiary"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
                  >
                    <Link href={activeSlide.secondaryHref}>
                      {activeSlide.secondaryCtaText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Slide Visual Feature Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <activeSlide.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white/60 uppercase">
                          Featured Flagship
                        </div>
                        <div className="text-sm font-bold text-white truncate max-w-[180px]">
                          {activeSlide.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full">
                      <Star className="h-3.5 w-3.5 fill-amber-300" />
                      4.9 / 5.0
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Multi-Vendor Buy-Box Winner
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">TechDirect Express</div>
                        <div className="text-[11px] text-white/70">
                          Authorized Distributor • Same-Day Dispatch
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px] font-bold">
                        Top Rated
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-4 space-y-2 text-xs text-white/80">
                    <div className="flex justify-between">
                      <span className="text-white/60">Carrier Tracking:</span>
                      <span className="font-medium text-white">
                        Express Air (2-3 Business Days)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Warranty:</span>
                      <span className="font-medium text-white">2-Year Official Protection</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Payment Protection:</span>
                      <span className="font-medium text-emerald-400">Escrow Secured</span>
                    </div>
                  </div>

                  <Button asChild variant="secondary" className="w-full font-bold">
                    <Link href={`/products/${activeSlide.productSlug}`}>
                      View Product Specifications
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Carousel Controls (Dots & Navigation) */}
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentSlideIndex === idx
                        ? 'w-8 bg-white'
                        : 'w-2.5 bg-white/40 hover:bg-white/60'
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </Container>
        </div>

        {/* 2. VALUE PROPOSITION RIBBON (Trust Badges) */}
        <div className="border-y border-border-subtle bg-surface shadow-xs">
          <Container className="py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
              <div className="flex items-center gap-3.5 py-2 sm:py-0 px-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-fg-primary">Free Express Shipping</div>
                  <div className="text-xs text-fg-muted">Complimentary on orders over $150</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 py-2 sm:py-0 px-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-fg-primary">100% Authentic Guarantee</div>
                  <div className="text-xs text-fg-muted">Certified from authorized sellers</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 py-2 sm:py-0 px-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-fg-primary">
                    30-Day Hassle-Free Returns
                  </div>
                  <div className="text-xs text-fg-muted">Prepaid labels & quick refunds</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 py-2 sm:py-0 px-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Headset className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-fg-primary">24/7 Verified Support</div>
                  <div className="text-xs text-fg-muted">Dedicated multi-vendor assistance</div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES SHOWCASE */}
      <Section spacing="md">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Layers className="h-4 w-4" />
                Marketplace Catalog
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
                Browse by Category
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                Explore thousands of authenticated products across top verified departments
              </p>
            </div>
            <Button asChild variant="tertiary" size="sm">
              <Link href="/products">
                View All Categories
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md text-left"
              >
                <div className="space-y-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.accentBg} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-fg-primary group-hover:text-primary transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-fg-muted mt-0.5">{cat.count}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Shop Department
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. FLASH DEALS & LIMITED-TIME OFFERS SHELF */}
      <Section spacing="md" className="bg-surface-subtle/50 border-y border-border-subtle">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
                    Flash Deals & Daily Steals
                  </h2>
                  <Badge
                    variant="destructive"
                    className="font-bold text-2xs uppercase animate-pulse"
                  >
                    Hot Deals
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-fg-muted mt-0.5">
                  Limited quantities available at discounted rates from verified merchants
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-2.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive px-1">
                <Clock className="h-4 w-4" />
                <span>Ends In:</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-mono font-bold text-fg-primary">
                <span className="rounded-lg bg-surface-muted px-2 py-1">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="rounded-lg bg-surface-muted px-2 py-1">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="rounded-lg bg-surface-muted px-2 py-1 text-destructive">
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <TrendingUp className="h-4 w-4" />
                Customer Favorites
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
                Trending Marketplace Selections
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                Best-selling products backed by multiple competitive vendor offers
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border border-border-subtle rounded-xl p-1 bg-surface-subtle">
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
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTrendingTab === tab.id
                      ? 'bg-surface text-fg-primary shadow-xs'
                      : 'text-fg-muted hover:text-fg-primary'
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
      <Section spacing="md" className="bg-surface-subtle/40 border-y border-border-subtle">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Award className="h-4 w-4" />
                Verified Merchant Network
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-fg-primary">
                Featured Brand Stores & Merchants
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                Shop directly from authorized distributors, flagship stores, and certified sellers
              </p>
            </div>
            <Button asChild variant="tertiary" size="sm">
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
                className="group flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-lg">
                      <Store className="h-6 w-6" />
                    </div>
                    {seller.isVerified && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Merchant
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-fg-primary group-hover:text-primary transition-colors">
                      {seller.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-fg-muted">
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
                        className="rounded-md bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-fg-subtle capitalize"
                      >
                        {b.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-xl bg-surface-subtle p-3 text-xs text-fg-muted space-y-1">
                    <div className="flex justify-between">
                      <span>Positive Feedback:</span>
                      <span className="font-semibold text-fg-primary">
                        {seller.rating.positiveFeedbackPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fulfillment:</span>
                      <span className="font-semibold text-fg-primary">Insured Express</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border-subtle">
                  <Button asChild variant="secondary" size="sm" className="w-full font-semibold">
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
      <Section spacing="lg" className="border-t border-border-subtle bg-surface">
        <Container>
          <div className="rounded-3xl border border-border-subtle bg-gradient-to-br from-surface to-surface-subtle p-8 sm:p-12 shadow-sm">
            <div className="max-w-3xl space-y-3">
              <Badge variant="neutral" className="font-bold uppercase text-2xs tracking-wider">
                Enterprise Standards
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-fg-primary">
                Why Millions Trust Our Global Multi-Vendor Platform
              </h2>
              <p className="text-sm sm:text-base text-fg-muted leading-relaxed">
                We connect certified independent merchants with discerning shoppers, providing
                strict quality moderation, competitive multi-offer pricing, and end-to-end
                transaction security.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border-subtle">
              <div className="space-y-2">
                <div className="text-primary font-bold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Buyer Protection Escrow
                </div>
                <p className="text-xs text-fg-muted leading-relaxed">
                  Payments are held securely in escrow until order delivery and verification,
                  eliminating counterfeit risk and non-fulfillment.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-primary font-bold text-sm flex items-center gap-1.5">
                  <Store className="h-4 w-4" />
                  Vetted Merchant Registry
                </div>
                <p className="text-xs text-fg-muted leading-relaxed">
                  Every merchant undergoes business license verification, tax ID validation, and
                  ongoing fulfillment metric audits before listing.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-primary font-bold text-sm flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  Universal Return Policy
                </div>
                <p className="text-xs text-fg-muted leading-relaxed">
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
