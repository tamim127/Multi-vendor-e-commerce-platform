/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — SKELETON COMPONENT
 * ==============================================================================
 * Shimmering loading state matching PDP desktop and mobile wireframes.
 */

'use client';

import * as React from 'react';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton/skeleton';

export function PdpSkeleton(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Breadcrumbs shimmer */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Gallery Skeleton (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="size-16 sm:size-20 rounded-lg shrink-0" />
            <Skeleton className="size-16 sm:size-20 rounded-lg shrink-0" />
            <Skeleton className="size-16 sm:size-20 rounded-lg shrink-0" />
          </div>
        </div>

        {/* Right: Info, Price & Purchasing (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 sm:h-10 w-4/5" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Variant Selector */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>

          {/* Availability */}
          <Skeleton className="h-5 w-28" />

          {/* Purchasing Box */}
          <div className="rounded-xl border border-border-default bg-surface p-5 flex flex-col gap-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Tabs shimmer */}
      <div className="mt-12 pt-6 border-t border-border-default flex flex-col gap-6">
        <div className="flex gap-6 border-b border-border-default pb-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-24" />
        </div>
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}
