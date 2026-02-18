import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();
    let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) settings = await prisma.siteSettings.create({ data: { id: "main", siteName: "Chronos" } });
    return NextResponse.json(settings);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 401 }); }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAuth();
    const data = await req.json();
    const settings = await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: { siteName: data.siteName, logo: data.logo, socials: data.socials, seoTitle: data.seoTitle, seoDescription: data.seoDescription, ogImage: data.ogImage, footerText: data.footerText, analyticsId: data.analyticsId },
      create: { id: "main", siteName: data.siteName || "Chronos" },
    });
    return NextResponse.json(settings);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
