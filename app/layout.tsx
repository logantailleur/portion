import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import UpdateChecker from "@/components/UpdateChecker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Portion",
  description: "Portion",
  appleWebApp: {
    capable: true,
    title: "Portion",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0D9488" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
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
