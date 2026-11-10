import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/shell/app-shell';
import { PublicStorefrontView } from '@/features/seller';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${formattedTitle} | Marketplace Storefront`,
    description: `Shop authentic products, view ratings, and check return policies from ${formattedTitle}.`,
  };
}

export default async function StorefrontPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  return (
    <AppShell>
      <PublicStorefrontView slug={slug} />
    </AppShell>
  );
}

