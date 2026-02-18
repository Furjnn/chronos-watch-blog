import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/cta/ScrollProgress";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chronos | Premium Watch Blog & Reviews",
    template: "%s | Chronos",
  },
  description: "Your trusted source for luxury watch reviews, news, and insights.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Chronos | Premium Watch Blog & Reviews",
    description: "Your trusted source for luxury watch reviews, news, and insights.",
    siteName: "Chronos",
    images: [{ url: `${siteUrl}/og?title=Chronos` }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-[var(--bg)] text-[var(--text)]">
        <ScrollProgress />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
