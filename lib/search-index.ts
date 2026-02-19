import { SearchDocumentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TiptapNode = {
  text?: string;
  content?: TiptapNode[];
};

function collectText(node: TiptapNode | null | undefined, chunks: string[]) {
  if (!node) return;
  if (typeof node.text === "string") chunks.push(node.text);
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      collectText(child, chunks);
    }
  }
}

function plainTextFromTiptap(input: unknown) {
  if (!input || typeof input !== "object") return "";
  const chunks: string[] = [];
  collectText(input as TiptapNode, chunks);
  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

export async function upsertPostSearchDocument(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      excerpt: true,
      body: true,
      status: true,
      featured: true,
      publishedAt: true,
      tags: { select: { name: true } },
      categories: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });
  if (!post) return;

  await prisma.searchDocument.upsert({
    where: {
      documentType_documentId_locale: {
        documentType: SearchDocumentType.POST,
        documentId: post.id,
        locale: "en",
      },
    },
    create: {
      documentType: SearchDocumentType.POST,
      documentId: post.id,
      locale: "en",
      title: post.title,
      excerpt: post.excerpt || null,
      bodyText: plainTextFromTiptap(post.body),
      tags: post.tags.map((tag) => tag.name),
      categories: post.categories.map((category) => category.name),
      brand: post.brand?.name || null,
      isPublished: post.status === "PUBLISHED",
      scoreBoost: post.featured ? 1.35 : 1,
      publishedAt: post.publishedAt || null,
    },
    update: {
      title: post.title,
      excerpt: post.excerpt || null,
      bodyText: plainTextFromTiptap(post.body),
      tags: post.tags.map((tag) => tag.name),
      categories: post.categories.map((category) => category.name),
      brand: post.brand?.name || null,
      isPublished: post.status === "PUBLISHED",
      scoreBoost: post.featured ? 1.35 : 1,
      publishedAt: post.publishedAt || null,
    },
  });
}

export async function upsertReviewSearchDocument(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      title: true,
      verdict: true,
      body: true,
      status: true,
      rating: true,
      publishedAt: true,
      brand: { select: { name: true } },
    },
  });
  if (!review) return;

  await prisma.searchDocument.upsert({
    where: {
      documentType_documentId_locale: {
        documentType: SearchDocumentType.REVIEW,
        documentId: review.id,
        locale: "en",
      },
    },
    create: {
      documentType: SearchDocumentType.REVIEW,
      documentId: review.id,
      locale: "en",
      title: review.title,
      excerpt: review.verdict || null,
      bodyText: plainTextFromTiptap(review.body),
      tags: [],
      categories: [],
      brand: review.brand.name,
      isPublished: review.status === "PUBLISHED",
      scoreBoost: Math.max(1, review.rating / 8),
      publishedAt: review.publishedAt || null,
    },
    update: {
      title: review.title,
      excerpt: review.verdict || null,
      bodyText: plainTextFromTiptap(review.body),
      brand: review.brand.name,
      isPublished: review.status === "PUBLISHED",
      scoreBoost: Math.max(1, review.rating / 8),
      publishedAt: review.publishedAt || null,
    },
  });
}

export async function upsertBrandSearchDocument(brandId: string) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: {
      id: true,
      name: true,
      description: true,
      country: true,
      priceSegment: true,
      createdAt: true,
    },
  });
  if (!brand) return;

  await prisma.searchDocument.upsert({
    where: {
      documentType_documentId_locale: {
        documentType: SearchDocumentType.BRAND,
        documentId: brand.id,
        locale: "en",
      },
    },
    create: {
      documentType: SearchDocumentType.BRAND,
      documentId: brand.id,
      locale: "en",
      title: brand.name,
      excerpt: brand.description || null,
      bodyText: `${brand.country} ${brand.priceSegment}`,
      tags: [],
      categories: [],
      brand: brand.name,
      isPublished: true,
      scoreBoost: 1,
      publishedAt: brand.createdAt,
    },
    update: {
      title: brand.name,
      excerpt: brand.description || null,
      bodyText: `${brand.country} ${brand.priceSegment}`,
      brand: brand.name,
      isPublished: true,
      scoreBoost: 1,
      publishedAt: brand.createdAt,
    },
  });
}

export async function removeSearchDocument(documentType: SearchDocumentType, documentId: string) {
  await prisma.searchDocument.deleteMany({
    where: {
      documentType,
      documentId,
    },
  });
}
