import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where: any = {};
    if (status && status !== "all") where.status = status.toUpperCase();
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where, take: limit, skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, status: true, featured: true, views: true, publishedAt: true, createdAt: true, author: { select: { name: true } }, categories: { select: { name: true } } },
      }),
      prisma.post.count({ where }),
    ]);
    return NextResponse.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const data = await req.json();

    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        body: data.body || null,
        coverImage: data.coverImage || null,
        status: data.status || "DRAFT",
        featured: data.featured || false,
        readingTime: data.readingTime || null,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        ogImage: data.ogImage || null,
        authorId: data.authorId,
        brandId: data.brandId || null,
        categories: data.categoryIds?.length ? { connect: data.categoryIds.map((id: string) => ({ id })) } : undefined,
        tags: data.tagIds?.length ? { connect: data.tagIds.map((id: string) => ({ id })) } : undefined,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
