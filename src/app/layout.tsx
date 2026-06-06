import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meridian.co";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Meridian — Revenue Operating System",
    template: "%s — Meridian",
  },
  description:
    "Meridian builds revenue operating systems for ambitious B2B businesses. Systematic lead generation, sales infrastructure, and measurable growth. Not retainer vagueness.",
  keywords: [
    "revenue operations",
    "lead generation system",
    "sales infrastructure",
    "B2B growth agency",
    "revenue operating system",
    "pipeline management",
    "outbound systems",
  ],
  authors: [{ name: "Meridian" }],
  creator: "Meridian",
  publisher: "Meridian",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Meridian",
    title: "Meridian — Revenue Operating System",
    description:
      "We build the operational infrastructure that transforms how ambitious businesses generate, qualify, and convert revenue at scale.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Meridian — Revenue Operating System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian — Revenue Operating System",
    description:
      "Systematic growth infrastructure for ambitious revenue teams.",
    images: ["/og-image.png"],
    creator: "@meridian",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://cal.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://app.cal.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cal.com" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#111111] font-sans">
        {children}
      </body>
    </html>
  );
}
