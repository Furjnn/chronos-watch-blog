import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { localizePathname } from "@/lib/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, reviews, brands] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.review.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const contentDates = [
    ...posts.map((post) => post.updatedAt),
    ...reviews.map((review) => review.updatedAt),
    ...brands.map((brand) => brand.updatedAt),
  ];
  const staticLastModified =
    contentDates.length > 0
      ? new Date(Math.max(...contentDates.map((date) => date.getTime())))
      : new Date();

  const staticConfig: Record<string, { changeFrequency: "daily" | "weekly" | "monthly"; priority: number }> = {
    "/": { changeFrequency: "daily", priority: 1 },
    "/blog": { changeFrequency: "daily", priority: 0.9 },
    "/reviews": { changeFrequency: "daily", priority: 0.9 },
    "/brands": { changeFrequency: "weekly", priority: 0.8 },
    "/about": { changeFrequency: "monthly", priority: 0.5 },
  };
  const staticBasePaths = Object.keys(staticConfig) as (keyof typeof staticConfig)[];
  const staticRoutes: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    staticBasePaths.map((basePath) => ({
      url: absoluteUrl(localizePathname(basePath, locale)),
      lastModified: staticLastModified,
      changeFrequency: staticConfig[basePath].changeFrequency,
      priority: staticConfig[basePath].priority,
    })),
  );

  const postRoutes = SUPPORTED_LOCALES.flatMap((locale) =>
    posts.map((post) => ({
      url: absoluteUrl(localizePathname(`/blog/${post.slug}`, locale)),
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const reviewRoutes = SUPPORTED_LOCALES.flatMap((locale) =>
    reviews.map((review) => ({
      url: absoluteUrl(localizePathname(`/reviews/${review.slug}`, locale)),
      lastModified: review.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const brandRoutes = SUPPORTED_LOCALES.flatMap((locale) =>
    brands.map((brand) => ({
      url: absoluteUrl(localizePathname(`/brands/${brand.slug}`, locale)),
      lastModified: brand.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...staticRoutes, ...postRoutes, ...reviewRoutes, ...brandRoutes];
}
