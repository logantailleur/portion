import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import './globals.css';
import ThemeRegistry from './ThemeRegistry';
import UpdateChecker from '@/components/UpdateChecker';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Portion',
  description: 'Portion',
  appleWebApp: {
    capable: true,
    title: 'Portion',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F766E' },
    { media: '(prefers-color-scheme: dark)', color: '#0F766E' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            {children}
            <UpdateChecker />
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
