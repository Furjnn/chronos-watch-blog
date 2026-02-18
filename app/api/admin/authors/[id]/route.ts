import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(author);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const data = await req.json();
    const author = await prisma.author.update({ where: { id }, data: { name: data.name, slug: data.slug, bio: data.bio, avatar: data.avatar, role: data.role, socials: data.socials } });
    return NextResponse.json(author);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
