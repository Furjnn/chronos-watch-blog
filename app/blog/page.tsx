import { prisma } from "@/lib/prisma";
import BlogIndexClient from "./BlogIndexClient";
import type { Metadata } from "next";
import { formatDateByLocale } from "@/lib/i18n/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getLocaleAlternates } from "@/lib/i18n/metadata";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const alternates = getLocaleAlternates("/blog", locale);

  return {
    title: dictionary.meta.blogTitle,
    description: dictionary.meta.blogDescription,
    alternates,
    openGraph: {
      title: `${dictionary.meta.blogTitle} | Chronos`,
      description: dictionary.meta.blogDescription,
      url: absoluteUrl(alternates.canonical),
      type: "website",
    },
  };
}

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&q=80";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { category } = await searchParams;

  const [rawPosts, rawCategories] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: true, categories: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const posts = rawPosts.map((post) => ({
    id: post.id,
    cat: post.categories[0]?.name || dictionary.search.typeArticle,
    title: post.title,
    excerpt: post.excerpt || "",
    author: post.author?.name || "Chronos",
    avatar: (post.author?.name || "C")
      .split(" ")
      .map((word) => word[0])
      .join(""),
    date: formatDateByLocale(post.publishedAt, locale),
    readTime: `${post.readingTime || 8} ${dictionary.common.min}`,
    img: post.coverImage || fallbackImg,
    slug: post.slug,
  }));

  const allCategory = dictionary.blog.allCategory;
  const categories = [allCategory, ...rawCategories.map((categoryItem) => categoryItem.name)];
  const normalizedQuery = category ? slugify(category) : "";
  const initialCategory = categories.find((item) => slugify(item) === normalizedQuery) || allCategory;

  return <BlogIndexClient key={initialCategory} posts={posts} categories={categories} initialCategory={initialCategory} />;
}
