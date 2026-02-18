import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
    return NextResponse.json({ tags });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const data = await req.json();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const tag = await prisma.tag.create({ data: { name: data.name, slug } });
    return NextResponse.json(tag, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
