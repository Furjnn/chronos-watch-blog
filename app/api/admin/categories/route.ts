import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const data = await req.json();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const cat = await prisma.category.create({ data: { name: data.name, slug, description: data.description || null, icon: data.icon || null } });
    return NextResponse.json(cat, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


