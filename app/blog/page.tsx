import { prisma } from "@/lib/prisma";
import BlogIndexClient from "./BlogIndexClient";

export const revalidate = 60;

export const metadata = {
  title: "The Journal",
  description: "In-depth reviews, stories, and insights from the world of horology",
};

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&q=80";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BlogPage() {
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

  return <BlogIndexClient posts={posts} categories={categories} />;
}
