import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { BrandSplash } from "@/components/landing/BrandSplash";
import { Providers } from "@/components/providers";

/**
 * Lellina — Premium Typography
 * Fraunces: editorial luxury serif with optical sizing (display/headings)
 * Inter: maximum-legibility professional sans (body/UI)
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://lellina-dev.onrender.com"),
  title: {
    default: "Lellina — Galz for Galz | Verified Women-Only Space",
    template: "%s · Lellina",
  },
  description:
    "Lellina is a verified women-only social app. No men. No bots. No catfish. Just real women looking for real connection.",
  keywords: [
    "Lellina",
    "Galz for Galz",
    "women social app",
    "verified women",
    "safe space",
    "women only",
  ],
  authors: [{ name: "Lellina" }],
  creator: "Lellina",
  publisher: "Lellina",
  applicationName: "Lellina",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  openGraph: {
    title: "Lellina — Galz for Galz",
    description:
      "The only verified women-only app. Safe, real, and exclusively for women.",
    url: process.env.NEXTAUTH_URL ?? "https://lellina-dev.onrender.com",
    siteName: "Lellina",
    type: "website",
    locale: "en",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lellina — Galz for Galz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lellina — Galz for Galz",
    description:
      "The only verified women-only app. Safe, real, and exclusively for women.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: process.env.NEXTAUTH_URL ?? "https://lellina-dev.onrender.com",
  },
  category: "social",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport = {
  themeColor: "#1A1614",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${inter.variable} antialiased bg-background text-foreground font-body`}
      >
        <BrandSplash />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
