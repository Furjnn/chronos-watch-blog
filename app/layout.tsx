import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/cta/ScrollProgress";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import PageMetrics from "@/components/analytics/PageMetrics";
import AdSenseScript from "@/components/ads/AdSenseScript";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getLocaleAlternates } from "@/lib/i18n/metadata";
import { localizePathname } from "@/lib/i18n/routing";
import { prisma } from "@/lib/prisma";
import { extractHeaderNavigationFromSocials } from "@/lib/navigation";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { maybeRunScheduledPublishing } from "@/lib/scheduler";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const title = dictionary.meta.rootTitle;
  const description = dictionary.meta.rootDescription;
  const alternates = getLocaleAlternates("/", locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | Chronos`,
    },
    description,
    alternates: {
      ...alternates,
      types: {
        "application/rss+xml": absoluteUrl("/rss.xml"),
      },
    },
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
      url: absoluteUrl(alternates.canonical),
      title,
      description,
      siteName: "Chronos",
      images: [{ url: absoluteUrl("/og?title=Chronos") }],
      locale: locale === "tr" ? "tr_TR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/og?title=Chronos")],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await maybeRunScheduledPublishing();
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { socials: true },
  });
  const navigation = extractHeaderNavigationFromSocials(settings?.socials);
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Chronos",
    url: siteUrl,
    description: dictionary.meta.rootDescription,
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(localizePathname("/search", locale))}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Chronos",
    url: siteUrl,
    logo: absoluteUrl("/favicon.ico"),
    sameAs: [],
  };

  return (
    <html lang={locale} className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-[var(--bg)] text-[var(--text)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <I18nProvider locale={locale} dictionary={dictionary}>
          <AdSenseScript />
          <PageMetrics />
          <ScrollProgress />
          <Header navigation={navigation} />
          <main>{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
