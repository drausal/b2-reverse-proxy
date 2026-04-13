import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B2 Reverse Proxy – High-Performance Cloud Storage Gateway",
  description:
    "Serve Backblaze B2 files through your own domain with zero latency overhead. Enterprise-grade CDN alternative.",
  metadataBase: new URL("https://files.on.tires"),
  openGraph: {
    title: "B2 Reverse Proxy",
    description:
      "Serve Backblaze B2 files through your own domain with zero latency overhead.",
    url: "https://files.on.tires",
    siteName: "B2 Reverse Proxy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "B2 Reverse Proxy",
    description:
      "Serve Backblaze B2 files through your own domain with zero latency overhead.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
