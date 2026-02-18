import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(author);
  } catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const data = await req.json();
    const author = await prisma.author.update({ where: { id }, data: { name: data.name, slug: data.slug, bio: data.bio, avatar: data.avatar, role: data.role, socials: data.socials } });
    return NextResponse.json(author);
  } catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) }); }
}


