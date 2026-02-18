import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, watchRef: true, rating: true, status: true, views: true, createdAt: true, brand: { select: { name: true } }, author: { select: { name: true } } },
    });
    return NextResponse.json({ reviews });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const data = await req.json();
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const review = await prisma.review.create({
      data: {
        title: data.title, slug, watchRef: data.watchRef, rating: data.rating,
        verdict: data.verdict || null, body: data.body || null,
        specs: data.specs || null, prosAndCons: data.prosAndCons || null,
        gallery: data.gallery || null,
        priceMin: data.priceMin || null, priceMax: data.priceMax || null,
        status: data.status || "DRAFT",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        seoTitle: data.seoTitle || null, seoDesc: data.seoDesc || null,
        authorId: data.authorId, brandId: data.brandId,
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


