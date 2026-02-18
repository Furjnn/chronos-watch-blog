import { prisma } from "@/lib/prisma";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search",
  description: "Search articles, reviews, and brands",
};

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=300&q=80";

function formatDate(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "";

  let results: any[] = [];

  if (query.length > 0) {
    const searchTerm = `%${query}%`;

    // Search posts
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { publishedAt: "desc" },
    });

    // Search reviews
    const reviews = await prisma.review.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { verdict: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      include: { brand: true },
    });

    // Search brands
    const brands = await prisma.brand.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    // Merge results
    results = [
      ...posts.map(p => ({
        id: p.id, type: "Article", title: p.title, excerpt: p.excerpt || "",
        date: formatDate(p.publishedAt), readTime: p.readingTime ? `${p.readingTime} min` : "",
        img: p.coverImage || fallbackImg, slug: `/blog/${p.slug}`,
      })),
      ...reviews.map(r => ({
        id: r.id, type: "Review", title: r.title, excerpt: r.verdict || "",
        date: formatDate(r.publishedAt), readTime: "",
        img: ((r.gallery as string[]) || [])[0] || fallbackImg, slug: `/reviews/${r.slug}`,
      })),
      ...brands.map(b => ({
        id: b.id, type: "Brand", title: b.name, excerpt: b.description || "",
        date: "", readTime: "", img: b.heroImage || b.logo || fallbackImg, slug: `/brands/${b.slug}`,
      })),
    ];
  }

  return <SearchClient initialResults={results} initialQuery={query} />;
}
