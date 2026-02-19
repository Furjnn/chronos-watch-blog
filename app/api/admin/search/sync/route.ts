import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  upsertBrandSearchDocument,
  upsertPostSearchDocument,
  upsertReviewSearchDocument,
} from "@/lib/search-index";

export async function POST() {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);

    const [postIds, reviewIds, brandIds] = await Promise.all([
      prisma.post.findMany({ select: { id: true } }),
      prisma.review.findMany({ select: { id: true } }),
      prisma.brand.findMany({ select: { id: true } }),
    ]);

    for (const post of postIds) {
      await upsertPostSearchDocument(post.id);
    }
    for (const review of reviewIds) {
      await upsertReviewSearchDocument(review.id);
    }
    for (const brand of brandIds) {
      await upsertBrandSearchDocument(brand.id);
    }

    return NextResponse.json({
      success: true,
      indexed: {
        posts: postIds.length,
        reviews: reviewIds.length,
        brands: brandIds.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to sync search index";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 401
      : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
