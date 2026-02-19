import { prisma } from "@/lib/prisma";
import { HeroSlider } from "@/components/hero/HeroSlider";
import { BrandStrip } from "@/components/sections/BrandStrip";
import { PopularPosts } from "@/components/sections/PopularPosts";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { Categories } from "@/components/sections/Categories";
import { Newsletter } from "@/components/cta/Newsletter";
import AdSlot from "@/components/ads/AdSlot";
import { getDictionary, getLocale } from "@/lib/i18n";
import { formatDateByLocale } from "@/lib/i18n/format";
import { ADSENSE_SLOTS } from "@/lib/ads";

export const revalidate = 60;

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1400&q=80";

export default async function HomePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const [featuredPosts, popularPosts, latestPosts, brands, cats] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED", featured: true }, take: 4, orderBy: { publishedAt: "desc" }, include: { categories: true } }),
    prisma.post.findMany({ where: { status: "PUBLISHED" }, take: 4, orderBy: { views: "desc" }, include: { author: true, categories: true } }),
    prisma.post.findMany({ where: { status: "PUBLISHED" }, take: 6, orderBy: { publishedAt: "desc" }, include: { author: true, categories: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ include: { _count: { select: { posts: true } } } }),
  ]);

  const slides =
    featuredPosts.length > 0
      ? featuredPosts.map((p) => ({
          id: p.id,
          badge: p.categories[0]?.name || dictionary.home.fallbackSlides[0].badge,
          title: p.title,
          excerpt: p.excerpt || "",
          image: p.coverImage || fallbackImg,
          slug: p.slug,
        }))
      : dictionary.home.fallbackSlides.map((slide, index) => ({
          id: String(index + 1),
          badge: slide.badge,
          title: slide.title,
          excerpt: slide.excerpt,
          image:
            index === 0
              ? fallbackImg
              : "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1400&q=80",
          slug: index === 0 ? "art-of-timekeeping" : "new-submariner",
        }));

  const brandNames =
    brands.length > 0
      ? brands.map((brand) => brand.name.toUpperCase())
      : ["ROLEX", "OMEGA", "PATEK PHILIPPE", "CARTIER", "AUDEMARS PIGUET", "TUDOR", "GRAND SEIKO", "IWC", "BREITLING"];

  const popular = popularPosts.map((post, index) => ({
    id: post.id,
    rank: index + 1,
    title: post.title,
    category: post.categories[0]?.name || dictionary.search.typeArticle,
    date: formatDateByLocale(post.publishedAt, locale),
    readTime: `${post.readingTime || 8} ${dictionary.common.min}`,
    views: `${post.views > 1000 ? `${(post.views / 1000).toFixed(1)}K` : post.views}`,
    image: post.coverImage || fallbackImg,
    slug: post.slug,
  }));

  const latest = latestPosts.map((post) => ({
    id: post.id,
    category: post.categories[0]?.name || dictionary.search.typeArticle,
    title: post.title,
    excerpt: post.excerpt || "",
    author: post.author?.name || "Chronos",
    date: formatDateByLocale(post.publishedAt, locale),
    readTime: `${post.readingTime || 8} ${dictionary.common.min}`,
    image: post.coverImage || fallbackImg,
    slug: post.slug,
  }));

  const categories = cats.map((category) => ({
    name: category.name,
    count: category._count.posts,
    icon: category.icon || "o",
  }));

  return (
    <>
      <HeroSlider slides={slides} />
      <BrandStrip brands={brandNames} />
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <AdSlot slot={ADSENSE_SLOTS.homeTop} />
      </div>
      {popular.length > 0 && <PopularPosts posts={popular} />}
      {latest.length > 0 && <LatestArticles posts={latest} />}
      {categories.length > 0 && <Categories categories={categories} />}
      <Newsletter />
    </>
  );
}
