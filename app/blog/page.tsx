import { client, urlFor } from "@/sanity/client";
import { blogIndexQuery } from "@/sanity/queries";
import BlogIndexClient from "./BlogIndexClient";

export const revalidate = 60;

export const metadata = {
  title: "The Journal",
  description: "In-depth reviews, stories, and insights from the world of horology",
};

function formatImage(img: any) {
  if (!img?.asset) return "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&q=80";
  return urlFor(img).width(600).quality(80).url();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function BlogPage() {
  const data = await client.fetch(blogIndexQuery);

  const posts = (data.posts || []).map((p: any) => ({
    id: p._id,
    cat: p.categories?.[0]?.name || "Article",
    title: p.title,
    excerpt: p.excerpt || "",
    author: p.author?.name || "Chronos",
    avatar: (p.author?.name || "C").split(" ").map((w: string) => w[0]).join(""),
    date: formatDate(p.publishedAt),
    readTime: `${p.readingTime || 8} min`,
    img: formatImage(p.coverImage),
    slug: p.slug?.current || "",
  }));

  const categories = ["All", ...(data.categories || []).map((c: any) => c.name)];

  return <BlogIndexClient posts={posts} categories={categories} />;
}
