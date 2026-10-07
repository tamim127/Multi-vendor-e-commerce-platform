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
 * Enterprise Global Marketplace Footer.
 * Features trust guarantee badges, multi-column navigation, newsletter subscription shell,
 * and compliance/security landmarks.
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
        'w-full border-t border-border-subtle bg-surface text-fg-primary pt-12 pb-24 lg:pb-12',
        className
      )}
      {...props}
    >
      {/* 1. Value Proposition & Trust Badges Strip */}
      <div className="border-b border-border-subtle pb-10">
        <Container size="standard">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Truck className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-fg-primary">
                  {t('footer.logistics')}
                </h5>
                <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
                  {t('footer.logisticsDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-fg-primary">
                  {t('footer.escrow')}
                </h5>
                <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
                  {t('footer.escrowDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <RefreshCw className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-fg-primary">
                  {t('footer.returns')}
                </h5>
                <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
                  {t('footer.returnsDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Headphones className="size-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-fg-primary">
                  {t('footer.support')}
                </h5>
                <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
                  {t('footer.supportDesc')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Main Footer Navigation & Newsletter */}
      <div className="py-12 border-b border-border-subtle">
        <Container size="standard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
            {/* Brand Statement Column */}
            <div className="lg:col-span-2 space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 select-none"
                aria-label="Marketplace Homepage"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-base shadow-xs">
                  M
                </div>
                <span className="font-extrabold text-lg tracking-tight text-fg-primary">
                  MARKETPLACE
                </span>
              </Link>

              <p className="text-xs text-fg-muted leading-relaxed max-w-sm">
                The global multi-vendor commerce infrastructure connecting verified independent
                merchants, enterprise suppliers, and discerning clients worldwide.
              </p>

              {/* Newsletter Signup Shell */}
              <div className="pt-2 max-w-sm">
                <span className="text-xs font-semibold text-fg-primary block mb-2">
                  {t('footer.newsletterTitle')}
                </span>

                {isSubscribed ? (
                  <p className="text-xs font-medium text-success bg-success/10 p-2.5 rounded-md border border-success/20">
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
                      className="h-9 text-xs"
                    />
                    <Button type="submit" size="sm" variant="primary" className="h-9 shrink-0">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-fg-primary">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
                      >
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary">
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
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-fg-muted text-center sm:text-left"
        >
          <div>
            <p>
              © {new Date().getFullYear()} Marketplace Technologies Corp. {t('footer.copyright')}
            </p>
            <p className="text-[11px] text-fg-muted/70 mt-0.5">
              Multi-Vendor Core Platform • Production Architecture Baseline
            </p>
          </div>

          <div className="flex items-center gap-6 text-2xs">
            <Link href="/security" className="hover:text-primary transition-colors">
              Security Architecture
            </Link>
            <div className="size-1 rounded-full bg-border-subtle" />
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Framework
            </Link>
            <div className="size-1 rounded-full bg-border-subtle" />
            <Link href="/compliance" className="hover:text-primary transition-colors">
              Payment Standards Baseline
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
