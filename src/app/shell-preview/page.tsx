'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/shell/app-shell';
import { Container, Section } from '@/components/layout/container/container';
import { Badge } from '@/components/ui/badge/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card/card';

export default function ShellPreviewPage(): React.JSX.Element {
  return (
    <AppShell>
      <Section spacing="md">
        <Container size="standard" className="space-y-8">
          {/* Diagnostic Header */}
          <div className="border-b border-border-subtle pb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand">Phase 1E Architecture</Badge>
              <Badge variant="success" dot>
                Shell Verified
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-fg-primary">
              Global Application Shell Verification Surface
            </h1>
            <p className="text-sm text-fg-muted mt-1 max-w-2xl">
              This internal page verifies the responsive shell chrome: Desktop 3-tier header,
              Mega-menu catalogue flyout, Mobile header &amp; drawer, Skip-to-content accessibility
              link, Site footer, and Mobile bottom navigation.
            </p>
          </div>

          {/* Container Size Diagnostic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Responsive Breakpoint Targets</CardTitle>
                <CardDescription>WCAG 2.2 and mobile-first validation</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-fg-muted space-y-1 font-mono">
                <p>• Mobile Compact: 320px – 390px</p>
                <p>• Mobile Standard: 390px – 430px</p>
                <p>• Tablet / Mid-screen: 768px – 1024px</p>
                <p>• Desktop Baseline: 1280px – 1440px</p>
                <p>• Ultra-wide / 4K: 1920px – 2560px+</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Navigation Landmarks</CardTitle>
                <CardDescription>Accessibility and screen-reader hierarchy</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-fg-muted space-y-1">
                <p>• SkipToContent: #main-content link</p>
                <p>• Banner: &lt;header role="banner"&gt;</p>
                <p>• Main: &lt;main id="main-content"&gt;</p>
                <p>• Contentinfo: &lt;footer role="contentinfo"&gt;</p>
                <p>• Search: &lt;form role="search"&gt;</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shell Foundations</CardTitle>
                <CardDescription>Positioning and safe-area architecture</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-fg-muted space-y-1">
                <p>• Sticky header with blur backdrop</p>
                <p>• Fixed mobile bottom navigation</p>
                <p>• iOS safe-area bottom inset padding</p>
                <p>• Fully decoupled typed navigation config</p>
                <p>• Zero arbitrary hardcoded colors</p>
              </CardContent>
            </Card>
          </div>

          {/* Container Width Tests */}
          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-fg-muted">
              Container Width Stress Harness
            </h2>

            <div className="rounded-md border border-dashed border-border-default p-4 text-center text-xs text-fg-muted">
              Standard Content Container (max-w-7xl / 1280px)
            </div>
          </div>
        </Container>
      </Section>
    </AppShell>
  );
}
