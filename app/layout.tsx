import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Portion",
  description: "Portion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
