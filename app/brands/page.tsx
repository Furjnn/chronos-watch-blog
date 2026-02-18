import { prisma } from "@/lib/prisma";
import BrandsClient from "./BrandsClient";
import type { Metadata } from "next";

export const revalidate = 60;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Watch Brands",
  description: "Explore the world's finest watchmakers",
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Watch Brands | Chronos",
    description: "Explore the world's finest watchmakers",
    url: `${siteUrl}/brands`,
    type: "website",
  },
};

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&q=80";

export default async function BrandsPage() {
  const rawBrands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true, reviews: true } } },
  });

  const brands = rawBrands.map(b => ({
    name: b.name,
    country: b.country,
    segment: b.priceSegment.replace("_", "-"),
    founded: b.founded || 0,
    articles: b._count.posts + b._count.reviews,
    img: b.heroImage || b.logo || fallbackImg,
    slug: b.slug,
  }));

  return <BrandsClient brands={brands} />;
}
