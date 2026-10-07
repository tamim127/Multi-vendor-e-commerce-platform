import type { Metadata } from 'next';
import '../styles/globals.css';
import { fontVariablesClass } from '../styles/typography';
import { ThemeProvider, themeInitScript } from '../lib/theme';

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
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
