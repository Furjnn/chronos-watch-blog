import { prisma } from "@/lib/prisma";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { BrandStrip } from "@/components/sections/BrandStrip";
import { PopularPosts } from "@/components/sections/PopularPosts";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { Categories } from "@/components/sections/Categories";
import { Newsletter } from "@/components/cta/Newsletter";

export const revalidate = 60;

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1400&q=80";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function HomePage() {
  const [featuredPosts, popularPosts, latestPosts, brands, cats] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED", featured: true }, take: 4, orderBy: { publishedAt: "desc" }, include: { categories: true } }),
    prisma.post.findMany({ where: { status: "PUBLISHED" }, take: 4, orderBy: { views: "desc" }, include: { author: true, categories: true } }),
    prisma.post.findMany({ where: { status: "PUBLISHED" }, take: 6, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ include: { _count: { select: { posts: true } } } }),
  ]);

  const slides = featuredPosts.length > 0
    ? featuredPosts.map(p => ({
        id: p.id,
        badge: p.categories[0]?.name || "Featured",
        title: p.title,
        excerpt: p.excerpt || "",
        image: p.coverImage || fallbackImg,
        slug: p.slug,
      }))
    : [
        { id: "1", badge: "Featured", title: "The Art of Timekeeping", excerpt: "Exploring the craftsmanship behind the world's most prestigious timepieces", image: fallbackImg, slug: "art-of-timekeeping" },
        { id: "2", badge: "Editor's Pick", title: "The New Submariner: A Deep Dive", excerpt: "An in-depth look at the latest iteration of the iconic diving watch", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1400&q=80", slug: "new-submariner" },
      ];

  const brandNames = brands.length > 0 ? brands.map(b => b.name.toUpperCase()) : ["ROLEX", "OMEGA", "PATEK PHILIPPE", "CARTIER", "AUDEMARS PIGUET", "TUDOR", "GRAND SEIKO", "IWC", "BREITLING"];

  const popular = popularPosts.map((p, i) => ({
    id: p.id, rank: i + 1, title: p.title,
    category: p.categories[0]?.name || "Article",
    date: formatDate(p.publishedAt),
    readTime: `${p.readingTime || 8} min`,
    views: `${p.views > 1000 ? (p.views / 1000).toFixed(1) + "K" : p.views}`,
    image: p.coverImage || fallbackImg,
    slug: p.slug,
  }));

  const latest = latestPosts.map(p => ({
    id: p.id,
    category: p.categories[0]?.name || "Article",
    title: p.title, excerpt: p.excerpt || "",
    author: p.author?.name || "Chronos",
    date: formatDate(p.publishedAt),
    readTime: `${p.readingTime || 8} min`,
    image: p.coverImage || fallbackImg,
    slug: p.slug,
  }));

  const categories = cats.map(c => ({
    name: c.name, count: c._count.posts, icon: c.icon || "○",
  }));

  return (
    <>
      <HeroSlider slides={slides} />
      <BrandStrip brands={brandNames} />
      {popular.length > 0 && <PopularPosts posts={popular} />}
      {latest.length > 0 && <LatestArticles posts={latest} />}
      {categories.length > 0 && <Categories categories={categories} />}
      <Newsletter />
    </>
  );
}
