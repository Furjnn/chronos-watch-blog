import { prisma } from "@/lib/prisma";
import BlogIndexClient from "./BlogIndexClient";
import type { Metadata } from "next";

export const revalidate = 60;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "The Journal",
  description: "In-depth reviews, stories, and insights from the world of horology",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Journal | Chronos",
    description: "In-depth reviews, stories, and insights from the world of horology",
    url: `${siteUrl}/blog`,
    type: "website",
  },
};

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&q=80";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [rawPosts, rawCategories] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: true, categories: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const posts = rawPosts.map(p => ({
    id: p.id,
    cat: p.categories[0]?.name || "Article",
    title: p.title,
    excerpt: p.excerpt || "",
    author: p.author?.name || "Chronos",
    avatar: (p.author?.name || "C").split(" ").map(w => w[0]).join(""),
    date: formatDate(p.publishedAt),
    readTime: `${p.readingTime || 8} min`,
    img: p.coverImage || fallbackImg,
    slug: p.slug,
  }));

  const categories = ["All", ...rawCategories.map(c => c.name)];
  const normalizedQuery = category ? slugify(category) : "";
  const initialCategory = categories.find((cat) => slugify(cat) === normalizedQuery) || "All";

  return <BlogIndexClient key={initialCategory} posts={posts} categories={categories} initialCategory={initialCategory} />;
}
