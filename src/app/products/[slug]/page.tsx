import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/shell/app-shell';
import { CURRENCY_METADATA_REGISTRY } from '@/domains/catalog/utils/money';
import type { Money } from '@/domains/catalog/types/pricing';
import {
  getProductBySlug,
  getAllProductSlugs,
  ProductDetailInteractiveView,
} from '@/features/product-detail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Strict currency metadata consulting and decimal conversion for JSON-LD.
 * Omit value if currency metadata is invalid or missing in CURRENCY_METADATA_REGISTRY.
 */
function formatMinorToDecimalString(money: Money): string | null {
  if (
    !Number.isInteger(money.amountMinor) ||
    !Number.isFinite(money.amountMinor) ||
    money.amountMinor < 0
  ) {
    return null;
  }
  const meta = CURRENCY_METADATA_REGISTRY[money.currency];
  if (!meta || typeof meta.minorUnitDigits !== 'number' || meta.minorUnitDigits < 0) {
    return null;
  }
  const divisor = Math.pow(10, meta.minorUnitDigits);
  const decimalValue = money.amountMinor / divisor;
  return decimalValue.toFixed(meta.minorUnitDigits);
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);

  if (!data) {
    return {
      title: 'Product Not Found | Marketplace',
      description: 'The requested product could not be found.',
    };
  }

  const { product } = data;
  const title = product.title.en;
  const description = product.shortDescription?.en ?? product.description.en;
  const primaryImage =
    product.media.find((m) => m.role === 'primary')?.url ?? product.media[0]?.url;

  return {
    title: `${title} | Marketplace`,
    description,
    openGraph: {
      title,
      description,
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);

  // 404 Guard: Immediately invoke notFound() with zero product structured data
  if (!data) {
    notFound();
  }

  const { product, offers } = data;

  // Build JSON-LD structured data with multi-currency safety
  const eligibleOffers = offers;
  const currencies = new Set(eligibleOffers.map((o) => o.price.currency));
  const hasUniformCurrency =
    currencies.size === 1 &&
    product.offerSummary.lowestPrice.currency === product.offerSummary.highestPrice.currency;

  let offersStructuredData: Record<string, unknown> | Array<Record<string, unknown>> | undefined;

  if (hasUniformCurrency && eligibleOffers.length > 0) {
    const lowPriceStr = formatMinorToDecimalString(product.offerSummary.lowestPrice);
    const highPriceStr = formatMinorToDecimalString(product.offerSummary.highestPrice);
    const currency = product.offerSummary.lowestPrice.currency;

    if (lowPriceStr !== null && highPriceStr !== null) {
      offersStructuredData = {
        '@type': 'AggregateOffer',
        priceCurrency: currency,
        lowPrice: lowPriceStr,
        highPrice: highPriceStr,
        offerCount: eligibleOffers.length,
      };
    }
  } else if (eligibleOffers.length > 0) {
    // Mixed currency fallback: individual Offer items with valid formatting
    const individualOffers: Array<Record<string, unknown>> = [];
    for (const offer of eligibleOffers) {
      const priceStr = formatMinorToDecimalString(offer.price);
      if (priceStr !== null) {
        individualOffers.push({
          '@type': 'Offer',
          price: priceStr,
          priceCurrency: offer.price.currency,
          availability:
            offer.inventory.state === 'in_stock'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: offer.seller.name,
          },
        });
      }
    }
    if (individualOffers.length > 0) {
      offersStructuredData = individualOffers;
    }
  }

  // Canonical AggregateRating safeguard: count > 0 and average > 0
  const aggregateRating =
    product.ratingSummary.count > 0 && product.ratingSummary.average > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.ratingSummary.average,
          reviewCount: product.ratingSummary.count,
        }
      : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title.en,
    description: product.description.en,
    image: product.media.map((m) => m.url),
    brand: {
      '@type': 'Brand',
      name: product.brand.name,
    },
    sku: product.defaultVariantId ?? product.id,
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(offersStructuredData ? { offers: offersStructuredData } : {}),
  };

  return (
    <AppShell>
      {/* JSON-LD Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetailInteractiveView initialData={data} />
    </AppShell>
  );
}
