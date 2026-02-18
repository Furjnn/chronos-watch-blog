import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AboutPageClient from "@/components/about/AboutPageClient";
import { normalizeAboutPage } from "@/lib/about-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Chronos and our editorial team.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Chronos",
    description: "Learn more about Chronos and our editorial team.",
    url: `${siteUrl}/about`,
    type: "website",
  },
};

type SettingsSocials = {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  aboutPage?: unknown;
};

export default async function AboutPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const socials = (settings?.socials as SettingsSocials | null) || null;
  const aboutPage = normalizeAboutPage(socials?.aboutPage);

  return <AboutPageClient about={aboutPage} />;
}
