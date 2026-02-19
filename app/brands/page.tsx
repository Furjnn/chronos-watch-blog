import { prisma } from "@/lib/prisma";
import BrandsClient from "./BrandsClient";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getLocaleAlternates } from "@/lib/i18n/metadata";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const alternates = getLocaleAlternates("/brands", locale);

  return {
    title: dictionary.meta.brandsTitle,
    description: dictionary.meta.brandsDescription,
    alternates,
    openGraph: {
      title: `${dictionary.meta.brandsTitle} | Chronos`,
      description: dictionary.meta.brandsDescription,
      url: absoluteUrl(alternates.canonical),
      type: "website",
    },
  };
}

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&q=80";

export default async function BrandsPage() {
  const rawBrands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true, reviews: true } } },
  });

  const brands = rawBrands.map((brand) => ({
    name: brand.name,
    country: brand.country,
    segment: brand.priceSegment.replace("_", "-"),
    founded: brand.founded || 0,
    articles: brand._count.posts + brand._count.reviews,
    img: brand.heroImage || brand.logo || fallbackImg,
    slug: brand.slug,
  }));

  return <BrandsClient brands={brands} />;
}
