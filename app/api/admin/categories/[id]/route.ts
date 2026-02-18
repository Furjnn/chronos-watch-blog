import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const data = await req.json();
    const cat = await prisma.category.update({ where: { id }, data: { name: data.name, slug: data.slug, description: data.description, icon: data.icon } });
    return NextResponse.json(cat);
  } catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) { return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) }); }
}


