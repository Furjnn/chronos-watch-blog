// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    const [postCount, reviewCount, brandCount, draftCount, recentPosts, recentReviews] = await Promise.all([
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.review.count({ where: { status: "PUBLISHED" } }),
      prisma.brand.count(),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, status: true, createdAt: true, author: { select: { name: true } } },
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, rating: true, status: true, createdAt: true, brand: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      stats: { posts: postCount, reviews: reviewCount, brands: brandCount, drafts: draftCount },
      recentPosts,
      recentReviews,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
