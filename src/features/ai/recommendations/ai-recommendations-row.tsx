'use client';

/**
 * ==============================================================================
 * AI FEATURE — SMART RECOMMENDATIONS SHELF
 * ==============================================================================
 * Reusable recommendation row displaying similar, complementary, or trending
 * products with canonical pricing and AI curation badges.
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Star } from 'lucide-react';
import { getSimilarProducts } from '@/domains/ai/utils/recommendations';
import { formatMoneyMinor } from '@/domains/catalog/utils/money';
import { useTranslation } from '@/lib/i18n';
import type { RecommendationStrategy } from '@/domains/ai/types/search-recommendation';

export interface AIRecommendationsRowProps {
  productId?: string;
  strategy?: RecommendationStrategy;
  title?: string;
  limit?: number;
}

export function AIRecommendationsRow({
  productId = 'prod-macbook-pro-16',
  strategy = 'similar_products',
  title,
  limit = 4,
}: AIRecommendationsRowProps): React.JSX.Element {
  const { locale } = useTranslation();

  const recommendation = useMemo(() => {
    return getSimilarProducts(productId, limit, strategy);
  }, [productId, limit, strategy]);

  if (!recommendation.items || recommendation.items.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title || recommendation.title}</h3>
            {recommendation.subtitle && (
              <p className="text-xs text-muted-foreground">{recommendation.subtitle}</p>
            )}
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
          AI Curated
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {recommendation.items.map((item) => (
          <Link
            key={item.productId}
            href={`/products/${item.slug}`}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-3 shadow-xs hover:border-primary/50 hover:shadow-md transition-all text-card-foreground"
          >
            <div className="space-y-2.5">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                <Image
                  src={item.primaryImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                  {item.reasonLabel}
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.brandName}
                </div>
                <h4 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
                  {item.title}
                </h4>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs font-bold text-foreground">
                {formatMoneyMinor(item.price, { locale })}
              </span>
              <div className="flex items-center text-[10px] text-amber-500 font-medium">
                <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                {item.ratingAverage.toFixed(1)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
