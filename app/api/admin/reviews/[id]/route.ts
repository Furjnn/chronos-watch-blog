import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const review = await prisma.review.findUnique({ where: { id }, include: { brand: true, author: true } });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(review);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const data = await req.json();
    const review = await prisma.review.update({
      where: { id },
      data: {
        title: data.title, slug: data.slug, watchRef: data.watchRef, rating: data.rating,
        verdict: data.verdict, body: data.body, specs: data.specs, prosAndCons: data.prosAndCons,
        gallery: data.gallery, priceMin: data.priceMin, priceMax: data.priceMax,
        status: data.status, seoTitle: data.seoTitle, seoDesc: data.seoDesc,
        authorId: data.authorId, brandId: data.brandId,
      },
    });
    return NextResponse.json(review);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
