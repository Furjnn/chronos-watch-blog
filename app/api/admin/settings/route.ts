import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeAboutPage } from "@/lib/about-page";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) settings = await prisma.siteSettings.create({ data: { id: "main", siteName: "Chronos" } });
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 401
      : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const data = await req.json();
    const socials = data.socials || {};
    const normalizedSocials = {
      instagram: socials.instagram || "",
      twitter: socials.twitter || "",
      youtube: socials.youtube || "",
      aboutPage: normalizeAboutPage(socials.aboutPage),
    } as unknown as Prisma.InputJsonValue;
    const settings = await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: { siteName: data.siteName, logo: data.logo, socials: normalizedSocials, seoTitle: data.seoTitle, seoDescription: data.seoDescription, ogImage: data.ogImage, footerText: data.footerText, analyticsId: data.analyticsId },
      create: { id: "main", siteName: data.siteName || "Chronos" },
    });
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 400
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
