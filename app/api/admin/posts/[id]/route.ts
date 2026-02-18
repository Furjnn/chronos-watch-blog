import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true, categories: true, tags: true, brand: true },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const data = await req.json();

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        body: data.body || null,
        coverImage: data.coverImage || null,
        status: data.status || "DRAFT",
        featured: data.featured || false,
        readingTime: data.readingTime || null,
        publishedAt: data.status === "PUBLISHED" && !data.publishedAt ? new Date() : data.publishedAt,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        ogImage: data.ogImage || null,
        authorId: data.authorId,
        brandId: data.brandId || null,
        categories: { set: (data.categoryIds || []).map((cid: string) => ({ id: cid })) },
        tags: { set: (data.tagIds || []).map((tid: string) => ({ id: tid })) },
      },
    });
    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
