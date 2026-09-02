import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://phonebay.com"),
  title: {
    default: "PhoneBay — Buy. Sell. Verify.",
    template: "%s — PhoneBay",
  },
  description:
    "Buy and sell phones with confidence through professional verification, trusted sellers, and transparent device history.",
  icons: {
    icon: [
      { url: "/images/brand/favicon.ico" },
      { url: "/images/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/images/brand/apple-touch-icon.png",
  },
  manifest: "/images/brand/site.webmanifest",
  openGraph: {
    title: "PhoneBay — Buy. Sell. Verify.",
    description:
      "Buy and sell phones with confidence through professional verification, trusted sellers, and transparent device history.",
    siteName: "PhoneBay",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhoneBay — Buy. Sell. Verify.",
    description:
      "Buy and sell phones with confidence through professional verification, trusted sellers, and transparent device history.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
      </body>
    </html>
  );
}
