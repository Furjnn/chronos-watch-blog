import { client, urlFor } from "@/sanity/client";
import { brandsQuery } from "@/sanity/queries";
import BrandsClient from "./BrandsClient";

export const revalidate = 60;

export const metadata = {
  title: "Watch Brands",
  description: "Explore the world's finest watchmakers",
};

function formatImage(img: any) {
  if (!img?.asset) return "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&q=80";
  return urlFor(img).width(400).quality(80).url();
}

export default async function BrandsPage() {
  const rawBrands = await client.fetch(brandsQuery) || [];

  const brands = rawBrands.map((b: any) => ({
    name: b.name,
    country: `${b.country}`,
    segment: b.priceSegment || "Luxury",
    founded: b.founded || 0,
    articles: b.articleCount || 0,
    img: formatImage(b.heroImage || b.logo),
    slug: b.slug?.current || "",
  }));

  return <BrandsClient brands={brands} />;
}
