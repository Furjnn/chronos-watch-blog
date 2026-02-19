import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AboutPageClient from "@/components/about/AboutPageClient";
import { normalizeAboutPage } from "@/lib/about-page";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getLocaleAlternates } from "@/lib/i18n/metadata";
import { absoluteUrl } from "@/lib/seo";

type SettingsSocials = {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  aboutPage?: unknown;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const alternates = getLocaleAlternates("/about", locale);

  return {
    title: dictionary.meta.aboutTitle,
    description: dictionary.meta.aboutDescription,
    alternates,
    openGraph: {
      title: `${dictionary.meta.aboutTitle} | Chronos`,
      description: dictionary.meta.aboutDescription,
      url: absoluteUrl(alternates.canonical),
      type: "website",
    },
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const socials = (settings?.socials as SettingsSocials | null) || null;
  const aboutPage = normalizeAboutPage(socials?.aboutPage, locale);

  return <AboutPageClient about={aboutPage} />;
}
