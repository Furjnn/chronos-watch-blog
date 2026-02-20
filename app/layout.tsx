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

function resolveAssetUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return absoluteUrl(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { siteName: true },
  });
  const siteName = settings?.siteName?.trim() || "Chronos";
  const title = dictionary.meta.rootTitle;
  const description = dictionary.meta.rootDescription;
  const alternates = getLocaleAlternates("/", locale);
  const ogTitle = encodeURIComponent(siteName);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
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
      siteName,
      images: [{ url: absoluteUrl(`/og?title=${ogTitle}`) }],
      locale: locale === "tr" ? "tr_TR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(`/og?title=${ogTitle}`)],
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
    select: { socials: true, siteName: true, logo: true },
  });
  const siteName = settings?.siteName?.trim() || "Chronos";
  const logo = settings?.logo?.trim() || "";
  const organizationLogo = resolveAssetUrl(logo) || absoluteUrl("/favicon.ico");
  const navigation = extractHeaderNavigationFromSocials(settings?.socials);
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
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
    name: siteName,
    url: siteUrl,
    logo: organizationLogo,
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
          <Header navigation={navigation} siteName={siteName} logo={logo} />
          <main>{children}</main>
          <Footer siteName={siteName} logo={logo} />
        </I18nProvider>
      </body>
    </html>
  );
}
