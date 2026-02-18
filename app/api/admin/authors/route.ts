import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const authors = await prisma.author.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true, reviews: true } } } });
    return NextResponse.json({ authors });
  } catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) }); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const data = await req.json();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const author = await prisma.author.create({ data: { name: data.name, slug, bio: data.bio || null, avatar: data.avatar || null, role: data.role || null, socials: data.socials || null } });
    return NextResponse.json(author, { status: 201 });
  } catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) }); }
}


