import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Award, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Top Official Brands Directory | Aureon Marketplace',
  description: 'Shop official brand stores on Aureon: Apple, Samsung, Sony, Nike, Adidas, Dyson, and more.',
};

const BRANDS = [
  { name: 'Apple', slug: 'Apple', category: 'Consumer Electronics & Computing', count: '142 Products', badge: 'Official Store' },
  { name: 'Samsung', slug: 'Samsung', category: 'Displays & Smart Hardware', count: '98 Products', badge: 'Official Store' },
  { name: 'Sony', slug: 'Sony', category: 'Audio, Imaging & PlayStation', count: '84 Products', badge: 'Official Store' },
  { name: 'Nike', slug: 'Nike', category: 'Athletic Footwear & Activewear', count: '120 Products', badge: 'Official Store' },
  { name: 'Adidas', slug: 'Adidas', category: 'Sportswear & Performance Shoes', count: '105 Products', badge: 'Official Store' },
  { name: 'Dyson', slug: 'Dyson', category: 'Air Care & High-Tech Grooming', count: '32 Products', badge: 'Verified Partner' },
  { name: 'Herman Miller', slug: 'HermanMiller', category: 'Ergonomic Office Furniture', count: '28 Products', badge: 'Authorized Distributor' },
  { name: 'LEGO', slug: 'LEGO', category: 'Building Sets & Collector STEM', count: '64 Products', badge: 'Official Store' },
  { name: 'Nintendo', slug: 'Nintendo', category: 'Gaming Consoles & Titles', count: '45 Products', badge: 'Verified Partner' },
  { name: 'Dell', slug: 'Dell', category: 'Workstations & Enterprise Laptops', count: '52 Products', badge: 'Official Store' },
  { name: 'Bose', slug: 'Bose', category: 'Acoustic Sound & Headphones', count: '36 Products', badge: 'Official Store' },
  { name: 'Logitech', slug: 'Logitech', category: 'PC Peripherals & Streaming', count: '78 Products', badge: 'Official Store' },
  { name: 'Zara', slug: 'Zara', category: 'Contemporary European Fashion', count: '89 Products', badge: 'Verified Partner' },
  { name: 'The North Face', slug: 'TheNorthFace', category: 'Outdoor Expedition Apparel', count: '42 Products', badge: 'Verified Partner' },
  { name: 'Philips Hue', slug: 'Philips', category: 'Smart Lighting & IoT', count: '38 Products', badge: 'Authorized Distributor' },
];

export default function BrandsDirectoryPage(): React.JSX.Element {
  return (
    <AppShell>
      <div className="bg-slate-50 dark:bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white min-h-screen transition-colors py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="border-b border-[#1E1E24] pb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>Certified Brand Storefronts</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Official Marketplace Brands
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
              Explore authentic manufacturer stores. Every brand listed here is certified under our Strict Brand Authenticity Agreement with zero counterfeit tolerance.
            </p>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/products?q=${encodeURIComponent(brand.slug)}`}
                className="rounded-3xl border border-slate-200 dark:border-[#27272A] bg-gradient-to-b from-[#121216] to-[#0D0D10] p-6 shadow-xl hover:border-amber-400/50 hover:scale-[1.01] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold">
                      {brand.badge}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-[#71717A]">{brand.count}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-1">{brand.category}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1E1E24] flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Visit Brand Store</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
