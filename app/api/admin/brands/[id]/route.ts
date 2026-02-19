import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { removeSearchDocument, upsertBrandSearchDocument } from "@/lib/search-index";
import { SearchDocumentType } from "@prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(brand);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const context = getRequestContext(req);
    const { id } = await params;
    const data = await req.json();
    const brand = await prisma.brand.update({ where: { id }, data: { name: data.name, slug: data.slug, country: data.country, founded: data.founded, priceSegment: data.priceSegment, description: data.description, logo: data.logo, heroImage: data.heroImage, website: data.website } });
    await upsertBrandSearchDocument(brand.id);
    await logAuditEvent({
      action: "brand.updated",
      entityType: "brand",
      entityId: brand.id,
      summary: `Updated brand: ${brand.name}`,
      actor: { userId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return NextResponse.json(brand);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const existing = await prisma.brand.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    await prisma.brand.delete({ where: { id } });
    await removeSearchDocument(SearchDocumentType.BRAND, id);
    if (existing) {
      await logAuditEvent({
        action: "brand.deleted",
        entityType: "brand",
        entityId: existing.id,
        summary: `Deleted brand: ${existing.name}`,
        actor: { userId: session.id },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


