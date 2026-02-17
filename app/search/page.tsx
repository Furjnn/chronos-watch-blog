import { client, urlFor } from "@/sanity/client";
import { searchQuery } from "@/sanity/queries";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search",
  description: "Search articles, reviews, and brands",
};

function formatImage(img: any) {
  if (!img?.asset) return "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=300&q=80";
  return urlFor(img).width(300).quality(80).url();
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = { post: "Article", review: "Review", brand: "Brand", guide: "Guide" };
  return labels[type] || "Article";
}

function getUrl(type: string, slug: string) {
  const prefixes: Record<string, string> = { post: "/blog", review: "/reviews", brand: "/brands", guide: "/guides" };
  return `${prefixes[type] || "/blog"}/${slug}`;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "";

  let results: any[] = [];
  if (query.length > 0) {
    const raw = await client.fetch(searchQuery, { q: query });
    results = (raw || []).map((r: any) => ({
      id: r._id,
      type: getTypeLabel(r._type),
      title: r.title,
      excerpt: r.excerpt || "",
      date: formatDate(r.publishedAt),
      readTime: r.readingTime ? `${r.readingTime} min` : "",
      img: formatImage(r.image),
      slug: getUrl(r._type, r.slug?.current || ""),
    }));
  }

  return <SearchClient initialResults={results} initialQuery={query} />;
}
