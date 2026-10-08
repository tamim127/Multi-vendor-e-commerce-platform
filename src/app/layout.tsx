import type { Metadata } from 'next';
import '../styles/globals.css';
import { fontVariablesClass } from '../styles/typography';
import { ThemeProvider, themeInitScript } from '../lib/theme';
import { I18nProvider, i18nInitScript } from '../lib/i18n';
import { QueryProvider } from '../lib/query';

export const metadata: Metadata = {
  title: 'Enterprise Multi-Vendor Marketplace',
  description: 'World-Class Global Multi-Vendor E-Commerce Marketplace Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className={fontVariablesClass} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: i18nInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>{children}</QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
