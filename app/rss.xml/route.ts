import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [posts, reviews] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      take: 30,
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true, excerpt: true, publishedAt: true, updatedAt: true },
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED" },
      take: 30,
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true, verdict: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  const items = [
    ...posts.map((post) => ({
      title: post.title,
      link: `${siteUrl}/blog/${post.slug}`,
      description: post.excerpt || "",
      pubDate: post.publishedAt || post.updatedAt,
    })),
    ...reviews.map((review) => ({
      title: `${review.title} Review`,
      link: `${siteUrl}/reviews/${review.slug}`,
      description: review.verdict || "",
      pubDate: review.publishedAt || review.updatedAt,
    })),
  ]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 50);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Chronos</title>
    <link>${siteUrl}</link>
    <description>Latest articles and reviews from Chronos.</description>
    <language>en-US</language>
    ${items
      .map(
        (item) => `
    <item>
      <title>${xmlEscape(item.title)}</title>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
      <description>${xmlEscape(item.description)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
