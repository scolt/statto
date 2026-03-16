import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const BASE_URL = process.env.APP_BASE_URL ?? "https://statto.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Statto — Track Your Game Stats",
    template: "%s | Statto",
  },
  description:
    "Track your stats, compete with friends, and settle the score once and for all. Leaderboards, live matches, and group stats for any sport.",
  keywords: [
    "sports stats tracker",
    "game score tracker",
    "leaderboard app",
    "match tracker",
    "sports group stats",
    "statto",
  ],
  authors: [{ name: "Statto" }],
  creator: "Statto",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Statto",
    title: "Statto — Track Your Game Stats",
    description:
      "Track your stats, compete with friends, and settle the score once and for all.",
    url: BASE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Statto — Track Your Game Stats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Statto — Track Your Game Stats",
    description:
      "Track your stats, compete with friends, and settle the score once and for all.",
    images: ["/opengraph-image"],
  },
  other: {
    'google-adsense-account': 'ca-pub-2076261275903812',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#6d28d9",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-svh flex-col">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
