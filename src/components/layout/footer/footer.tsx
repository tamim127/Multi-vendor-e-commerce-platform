'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RefreshCw, Headphones, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container/container';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { useI18n } from '@/lib/i18n';
import { defaultFooterSections } from '@/config/navigation';
import type { FooterSection } from '@/types/navigation';

export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  sections?: FooterSection[];
}

/**
 * Enterprise Global Marketplace Footer — Aureon Luxury Theme.
 * Features dark luxury aesthetic, trust guarantee cards with gold accents,
 * multi-column navigation, newsletter subscription shell, and compliance/security landmarks.
 */
export function SiteFooter({
  sections = defaultFooterSections,
  className,
  ...props
}: SiteFooterProps): React.JSX.Element {
  const { t } = useI18n();
  const [newsletterEmail, setNewsletterEmail] = React.useState<string>('');
  const [isSubscribed, setIsSubscribed] = React.useState<boolean>(false);

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <footer
      role="contentinfo"
      className={cn(
        'w-full border-t border-slate-200 dark:border-[#1F1F24] bg-slate-50 dark:bg-[#0B0B0C] text-slate-800 dark:text-white pt-12 pb-24 lg:pb-12 transition-colors',
        className
      )}
      {...props}
    >
      {/* 1. Value Proposition & Trust Badges Strip */}
      <div className="border-b border-slate-200 dark:border-[#1F1F24] pb-10">
        <Container size="standard">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-[#27272A] shadow-xs transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                <Truck className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('footer.logistics')}
                </h5>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-0.5 leading-relaxed">
                  {t('footer.logisticsDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-[#27272A] shadow-xs transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('footer.escrow')}
                </h5>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-0.5 leading-relaxed">
                  {t('footer.escrowDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-[#27272A] shadow-xs transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                <RefreshCw className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('footer.returns')}
                </h5>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-0.5 leading-relaxed">
                  {t('footer.returnsDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-[#27272A] shadow-xs transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                <Headphones className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('footer.support')}
                </h5>
                <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-0.5 leading-relaxed">
                  {t('footer.supportDesc')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Main Footer Navigation & Newsletter */}
      <div className="py-12 border-b border-slate-200 dark:border-[#1F1F24]">
        <Container size="standard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
            {/* Brand Statement Column */}
            <div className="lg:col-span-2 space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 select-none group"
                aria-label="Marketplace Homepage"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  ▲
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                    Aureon
                  </span>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-600 dark:text-amber-400 leading-none mt-1">
                    MARKETPLACE
                  </span>
                </div>
              </Link>

              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] leading-relaxed max-w-sm">
                The global multi-vendor commerce infrastructure connecting verified independent
                merchants, enterprise suppliers, and discerning clients worldwide.
              </p>

              {/* Newsletter Signup Shell */}
              <div className="pt-2 max-w-sm">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                  {t('footer.newsletterTitle')}
                </span>

                {isSubscribed ? (
                  <p className="text-xs font-medium text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                    Thank you. You have been added to our trade newsletter dispatch.
                  </p>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={t('footer.newsletterPlaceholder')}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                      aria-label="Corporate email address for trade newsletter"
                      className="h-10 text-xs rounded-xl bg-white dark:bg-[#18181B] border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#71717A] focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      className="h-10 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shrink-0 transition-colors"
                    >
                      <span>{t('footer.newsletterJoin')}</span>
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Navigation Columns */}
            {sections.map((section) => (
              <div key={section.id} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-[#9CA3AF] dark:hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded-xs"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 text-[9px] font-bold">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* 3. Bottom Legal & Compliance Row */}
      <div className="pt-8">
        <Container
          size="standard"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#9CA3AF] text-center sm:text-left"
        >
          <div>
            <p>
              © {new Date().getFullYear()} Marketplace Technologies Corp. {t('footer.copyright')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#71717A] mt-0.5">
              Multi-Vendor Core Platform • Production Architecture Baseline
            </p>
          </div>

          <div className="flex items-center gap-6 text-2xs text-slate-500 dark:text-[#9CA3AF]">
            <Link href="/security" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Security Architecture
            </Link>
            <div className="size-1 rounded-full bg-slate-300 dark:bg-[#27272A]" />
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy Framework
            </Link>
            <div className="size-1 rounded-full bg-slate-300 dark:bg-[#27272A]" />
            <Link href="/compliance" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Payment Standards Baseline
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
