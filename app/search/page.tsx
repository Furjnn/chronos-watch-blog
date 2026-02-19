import { Prisma, SearchDocumentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import SearchClient from "./SearchClient";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/lib/i18n";
import { formatDateByLocale } from "@/lib/i18n/format";
import { getLocaleAlternates } from "@/lib/i18n/metadata";
import { absoluteUrl } from "@/lib/seo";
import { maybeRunScheduledPublishing } from "@/lib/scheduler";

const fallbackImg = "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=300&q=80";

type ResultType = "article" | "review" | "brand";
type SortType = "relevance" | "recent";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  excerpt: string;
  date: string;
  sortDate: number;
  readTime: string;
  img: string;
  slug: string;
  category?: string;
  brand?: string;
  score: number;
}

interface FacetItem {
  value: string;
  count: number;
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .slice(0, 8);
}

function scoreDocument(input: {
  query: string;
  tokens: string[];
  title: string;
  excerpt: string;
  bodyText: string;
  tags: string[];
  categories: string[];
  brand: string;
  scoreBoost: number;
}) {
  const q = input.query.toLowerCase();
  const title = input.title.toLowerCase();
  const excerpt = input.excerpt.toLowerCase();
  const bodyText = input.bodyText.toLowerCase();
  const tags = input.tags.map((item) => item.toLowerCase());
  const categories = input.categories.map((item) => item.toLowerCase());
  const brand = input.brand.toLowerCase();

  let score = 0;
  if (q.length > 0 && title.includes(q)) score += 120;
  if (q.length > 0 && excerpt.includes(q)) score += 45;
  if (q.length > 0 && bodyText.includes(q)) score += 20;

  for (const token of input.tokens) {
    if (title.includes(token)) score += 25;
    if (excerpt.includes(token)) score += 10;
    if (bodyText.includes(token)) score += 3;
    if (tags.some((tag) => tag.includes(token))) score += 8;
    if (categories.some((item) => item.includes(token))) score += 8;
    if (brand.includes(token)) score += 8;
  }

  return score * Math.max(input.scoreBoost || 1, 0.1);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const alternates = getLocaleAlternates("/search", locale);

  return {
    title: dictionary.meta.searchTitle,
    description: dictionary.meta.searchDescription,
    alternates,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
    openGraph: {
      title: `${dictionary.meta.searchTitle} | Chronos`,
      description: dictionary.meta.searchDescription,
      url: absoluteUrl(alternates.canonical),
      type: "website",
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; sort?: string; category?: string; brand?: string }>;
}) {
  await maybeRunScheduledPublishing();
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { q, type, sort, category, brand } = await searchParams;
  const query = String(q || "").trim();
  const tokens = tokenize(query);

  const selectedType = type === "article" || type === "review" || type === "brand" ? type : "all";
  const selectedSort: SortType = sort === "recent" ? "recent" : "relevance";
  const selectedCategory = String(category || "").trim();
  const selectedBrand = String(brand || "").trim();

  const where: Prisma.SearchDocumentWhereInput = {
    isPublished: true,
    ...(selectedType !== "all"
      ? {
          documentType:
            selectedType === "article"
              ? SearchDocumentType.POST
              : selectedType === "review"
                ? SearchDocumentType.REVIEW
                : SearchDocumentType.BRAND,
        }
      : {}),
    ...(selectedCategory ? { categories: { has: selectedCategory } } : {}),
    ...(selectedBrand ? { brand: { equals: selectedBrand, mode: "insensitive" } } : {}),
  };

  if (query.length > 0) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { bodyText: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      ...(tokens.length > 0
        ? [{ tags: { hasSome: tokens } }, { categories: { hasSome: tokens } }]
        : []),
    ];
  }

  const docs = query.length
    ? await prisma.searchDocument.findMany({
        where,
        take: 200,
        orderBy: [{ scoreBoost: "desc" }, { updatedAt: "desc" }],
      })
    : [];

  if (query.length > 0 && docs.length === 0) {
    const [posts, reviews, brands] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 40,
        orderBy: { publishedAt: "desc" },
        include: { categories: true },
      }),
      prisma.review.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { verdict: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 30,
        orderBy: { publishedAt: "desc" },
        include: { brand: true },
      }),
      prisma.brand.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 30,
        orderBy: { name: "asc" },
      }),
    ]);

    const fallbackResults: SearchResult[] = [
      ...posts.map((post) => ({
        id: `post:${post.id}`,
        type: "article" as const,
        title: post.title,
        excerpt: post.excerpt || "",
        date: formatDateByLocale(post.publishedAt, locale),
        sortDate: post.publishedAt ? post.publishedAt.getTime() : 0,
        readTime: post.readingTime ? `${post.readingTime} ${dictionary.common.min}` : "",
        img: post.coverImage || fallbackImg,
        slug: `/blog/${post.slug}`,
        category: post.categories[0]?.name,
        score: 1,
      })),
      ...reviews.map((review) => {
        const gallery = Array.isArray(review.gallery) ? review.gallery : [];
        const firstGalleryImage = typeof gallery[0] === "string" ? gallery[0] : null;
        return {
          id: `review:${review.id}`,
          type: "review" as const,
          title: review.title,
          excerpt: review.verdict || "",
          date: formatDateByLocale(review.publishedAt, locale),
          sortDate: review.publishedAt ? review.publishedAt.getTime() : 0,
          readTime: "",
          img: firstGalleryImage || fallbackImg,
          slug: `/reviews/${review.slug}`,
          brand: review.brand?.name,
          score: 1,
        };
      }),
      ...brands.map((brandItem) => ({
        id: `brand:${brandItem.id}`,
        type: "brand" as const,
        title: brandItem.name,
        excerpt: brandItem.description || "",
        date: "",
        sortDate: 0,
        readTime: "",
        img: brandItem.heroImage || brandItem.logo || fallbackImg,
        slug: `/brands/${brandItem.slug}`,
        brand: brandItem.name,
        score: 1,
      })),
    ];

    return (
      <SearchClient
        initialResults={fallbackResults}
        initialQuery={query}
        initialFilters={{
          type: selectedType,
          sort: selectedSort,
          category: selectedCategory,
          brand: selectedBrand,
        }}
        facets={{
          types: {
            article: posts.length,
            review: reviews.length,
            brand: brands.length,
          },
          categories: [],
          brands: [],
        }}
      />
    );
  }

  const postIds = docs.filter((doc) => doc.documentType === "POST").map((doc) => doc.documentId);
  const reviewIds = docs.filter((doc) => doc.documentType === "REVIEW").map((doc) => doc.documentId);
  const brandIds = docs.filter((doc) => doc.documentType === "BRAND").map((doc) => doc.documentId);

  const [posts, reviews, brands] = await Promise.all([
    postIds.length
      ? prisma.post.findMany({
          where: { id: { in: postIds }, status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            excerpt: true,
            coverImage: true,
            slug: true,
            publishedAt: true,
            readingTime: true,
          },
        })
      : Promise.resolve([]),
    reviewIds.length
      ? prisma.review.findMany({
          where: { id: { in: reviewIds }, status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            verdict: true,
            gallery: true,
            slug: true,
            publishedAt: true,
            brand: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    brandIds.length
      ? prisma.brand.findMany({
          where: { id: { in: brandIds } },
          select: {
            id: true,
            name: true,
            description: true,
            heroImage: true,
            logo: true,
            slug: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const postMap = new Map(posts.map((post) => [post.id, post]));
  const reviewMap = new Map(reviews.map((review) => [review.id, review]));
  const brandMap = new Map(brands.map((brand) => [brand.id, brand]));

  const typeCounts = { article: 0, review: 0, brand: 0 };
  const categoryFacetMap = new Map<string, number>();
  const brandFacetMap = new Map<string, number>();

  const results: SearchResult[] = [];

  for (const doc of docs) {
    const commonScore = scoreDocument({
      query,
      tokens,
      title: doc.title,
      excerpt: doc.excerpt || "",
      bodyText: doc.bodyText || "",
      tags: doc.tags,
      categories: doc.categories,
      brand: doc.brand || "",
      scoreBoost: doc.scoreBoost,
    });

    if (doc.documentType === "POST") {
      const post = postMap.get(doc.documentId);
      if (!post) continue;
      typeCounts.article += 1;
      for (const categoryName of doc.categories) {
        categoryFacetMap.set(categoryName, (categoryFacetMap.get(categoryName) || 0) + 1);
      }
      if (doc.brand) {
        brandFacetMap.set(doc.brand, (brandFacetMap.get(doc.brand) || 0) + 1);
      }
      results.push({
        id: `post:${post.id}`,
        type: "article",
        title: post.title,
        excerpt: post.excerpt || "",
        date: formatDateByLocale(post.publishedAt, locale),
        sortDate: post.publishedAt ? post.publishedAt.getTime() : 0,
        readTime: post.readingTime ? `${post.readingTime} ${dictionary.common.min}` : "",
        img: post.coverImage || fallbackImg,
        slug: `/blog/${post.slug}`,
        category: doc.categories[0],
        brand: doc.brand || undefined,
        score: commonScore,
      });
      continue;
    }

    if (doc.documentType === "REVIEW") {
      const review = reviewMap.get(doc.documentId);
      if (!review) continue;
      typeCounts.review += 1;
      if (review.brand?.name) {
        brandFacetMap.set(review.brand.name, (brandFacetMap.get(review.brand.name) || 0) + 1);
      }

      const gallery = Array.isArray(review.gallery) ? review.gallery : [];
      const firstGalleryImage = typeof gallery[0] === "string" ? gallery[0] : null;

      results.push({
        id: `review:${review.id}`,
        type: "review",
        title: review.title,
        excerpt: review.verdict || "",
        date: formatDateByLocale(review.publishedAt, locale),
        sortDate: review.publishedAt ? review.publishedAt.getTime() : 0,
        readTime: "",
        img: firstGalleryImage || fallbackImg,
        slug: `/reviews/${review.slug}`,
        brand: review.brand?.name || doc.brand || undefined,
        score: commonScore,
      });
      continue;
    }

    const brandItem = brandMap.get(doc.documentId);
    if (!brandItem) continue;

    typeCounts.brand += 1;
    brandFacetMap.set(brandItem.name, (brandFacetMap.get(brandItem.name) || 0) + 1);

    results.push({
      id: `brand:${brandItem.id}`,
      type: "brand",
      title: brandItem.name,
      excerpt: brandItem.description || "",
      date: "",
      sortDate: 0,
      readTime: "",
      img: brandItem.heroImage || brandItem.logo || fallbackImg,
      slug: `/brands/${brandItem.slug}`,
      brand: brandItem.name,
      score: commonScore,
    });
  }

  const orderedResults = [...results].sort((a, b) => {
    if (selectedSort === "recent") {
      if (b.sortDate !== a.sortDate) return b.sortDate - a.sortDate;
      return b.score - a.score;
    }
    return b.score - a.score;
  });

  const categoryFacets: FacetItem[] = [...categoryFacetMap.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const brandFacets: FacetItem[] = [...brandFacetMap.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <SearchClient
      initialResults={orderedResults}
      initialQuery={query}
      initialFilters={{
        type: selectedType,
        sort: selectedSort,
        category: selectedCategory,
        brand: selectedBrand,
      }}
      facets={{
        types: typeCounts,
        categories: categoryFacets,
        brands: brandFacets,
      }}
    />
  );
}
