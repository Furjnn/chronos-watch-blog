import { client, urlFor } from "@/sanity/client";
import { homeQuery } from "@/sanity/queries";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { BrandStrip } from "@/components/sections/BrandStrip";
import { PopularPosts } from "@/components/sections/PopularPosts";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { Categories } from "@/components/sections/Categories";
import { Newsletter } from "@/components/cta/Newsletter";

// Her 60 saniyede bir yeniden doğrula
export const revalidate = 60;

// Sanity'den gelen veriyi component prop'larına dönüştüren yardımcı
function formatImage(img: any) {
  if (!img?.asset) return "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=80";
  return urlFor(img).width(1400).quality(80).url();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function HomePage() {
  const data = await client.fetch(homeQuery);

  // Featured slides — Sanity'den veya fallback
  const slides = data.featured?.length > 0
    ? data.featured.map((p: any) => ({
        id: p._id,
        badge: p.category?.name || "Featured",
        title: p.title,
        excerpt: p.excerpt || "",
        image: formatImage(p.coverImage),
        slug: p.slug?.current || "",
      }))
    : [
        { id: "1", badge: "Featured", title: "The Art of Timekeeping", excerpt: "Exploring the craftsmanship behind the world's most prestigious timepieces", image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1400&q=80", slug: "art-of-timekeeping" },
        { id: "2", badge: "Editor's Pick", title: "The New Submariner: A Deep Dive", excerpt: "An in-depth look at the latest iteration of the iconic diving watch", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1400&q=80", slug: "new-submariner" },
      ];

  // Brands
  const brands = data.brands?.length > 0
    ? data.brands.map((b: any) => b.name?.toUpperCase())
    : ["ROLEX", "OMEGA", "PATEK PHILIPPE", "CARTIER", "AUDEMARS PIGUET", "TUDOR", "GRAND SEIKO", "IWC", "BREITLING"];

  // Popular posts
  const popular = data.popular?.length > 0
    ? data.popular.map((p: any, i: number) => ({
        id: p._id,
        rank: i + 1,
        title: p.title,
        category: p.categories?.[0]?.name || "Article",
        date: formatDate(p.publishedAt),
        readTime: `${p.readingTime || 8} min`,
        views: `${Math.floor(Math.random() * 20 + 10)}.${Math.floor(Math.random() * 9)}K`,
        image: formatImage(p.coverImage),
        slug: p.slug?.current || "",
      }))
    : [];

  // Latest articles
  const latest = data.latest?.length > 0
    ? data.latest.map((p: any) => ({
        id: p._id,
        category: p.categories?.[0]?.name || "Article",
        title: p.title,
        excerpt: p.excerpt || "",
        author: p.author?.name || "Chronos",
        date: formatDate(p.publishedAt),
        readTime: `${p.readingTime || 8} min`,
        image: formatImage(p.coverImage),
        slug: p.slug?.current || "",
      }))
    : [];

  // Categories (statik — Sanity'den de çekilebilir sonra)
  const categories = [
    { name: "Reviews", count: 124, icon: "★" },
    { name: "Vintage", count: 89, icon: "◎" },
    { name: "News", count: 201, icon: "◆" },
    { name: "Technical", count: 67, icon: "⚙" },
    { name: "Brands", count: 156, icon: "◈" },
    { name: "Buying Guides", count: 45, icon: "▸" },
    { name: "Collecting", count: 78, icon: "◉" },
    { name: "Interviews", count: 34, icon: "◇" },
  ];

  return (
    <>
      <HeroSlider slides={slides} />
      <BrandStrip brands={brands} />
      {popular.length > 0 && <PopularPosts posts={popular} />}
      {latest.length > 0 && <LatestArticles posts={latest} />}
      <Categories categories={categories} />
      <Newsletter />
    </>
  );
}
