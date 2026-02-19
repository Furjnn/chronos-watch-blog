import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { upsertBrandSearchDocument } from "@/lib/search-index";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, country: true, founded: true, priceSegment: true, createdAt: true,
        _count: { select: { posts: true, reviews: true } } },
    });
    return NextResponse.json({ brands });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const context = getRequestContext(req);
    const data = await req.json();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const brand = await prisma.brand.create({
      data: { name: data.name, slug, country: data.country, founded: data.founded || null, priceSegment: data.priceSegment || "LUXURY", description: data.description || null, logo: data.logo || null, heroImage: data.heroImage || null, website: data.website || null },
    });
    await upsertBrandSearchDocument(brand.id);
    await logAuditEvent({
      action: "brand.created",
      entityType: "brand",
      entityId: brand.id,
      summary: `Created brand: ${brand.name}`,
      actor: { userId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return NextResponse.json(brand, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


