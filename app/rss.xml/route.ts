import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { localizePathname } from "@/lib/i18n/routing";

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
      link: absoluteUrl(localizePathname(`/blog/${post.slug}`, DEFAULT_LOCALE)),
      description: post.excerpt || "",
      pubDate: post.publishedAt || post.updatedAt,
    })),
    ...reviews.map((review) => ({
      title: `${review.title} Review`,
      link: absoluteUrl(localizePathname(`/reviews/${review.slug}`, DEFAULT_LOCALE)),
      description: review.verdict || "",
      pubDate: review.publishedAt || review.updatedAt,
    })),
  ]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 50);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Chronos</title>
    <link>${siteUrl}</link>
    <description>Latest articles and reviews from Chronos.</description>
    <language>en-US</language>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
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
