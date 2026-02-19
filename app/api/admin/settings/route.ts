import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeAboutPage } from "@/lib/about-page";
import { normalizeHeaderNavigation } from "@/lib/navigation";
import {
  clearRuntimeMailSettingsCache,
  getStoredMailSettingsFromSocials,
  resolveMailSettingsUpdate,
  toPublicMailSettings,
  type MailSettingsUpdateInput,
} from "@/lib/mail-settings";

type SocialsPayload = {
  instagram?: unknown;
  twitter?: unknown;
  youtube?: unknown;
  aboutPage?: unknown;
  navigation?: unknown;
  mail?: unknown;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toSocialsObject(value: unknown): SocialsPayload {
  if (!value || typeof value !== "object") return {};
  return value as SocialsPayload;
}

function normalizeSocialsForStorage(input: {
  incomingSocials: SocialsPayload;
  existingSocials: SocialsPayload;
  mailUpdate: MailSettingsUpdateInput | null | undefined;
}) {
  const nextMail = resolveMailSettingsUpdate(
    getStoredMailSettingsFromSocials(input.existingSocials),
    input.mailUpdate,
  );

  return {
    instagram: asString(input.incomingSocials.instagram) || asString(input.existingSocials.instagram),
    twitter: asString(input.incomingSocials.twitter) || asString(input.existingSocials.twitter),
    youtube: asString(input.incomingSocials.youtube) || asString(input.existingSocials.youtube),
    aboutPage: normalizeAboutPage(input.incomingSocials.aboutPage ?? input.existingSocials.aboutPage),
    navigation: normalizeHeaderNavigation(input.incomingSocials.navigation ?? input.existingSocials.navigation),
    mail: nextMail,
  } as unknown as Prisma.InputJsonValue;
}

function sanitizeSettingsResponse(settings: {
  id: string;
  siteName: string;
  logo: string | null;
  socials: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  footerText: string | null;
  analyticsId: string | null;
  updatedAt: Date;
}) {
  const socials = toSocialsObject(settings.socials);
  const mail = toPublicMailSettings(getStoredMailSettingsFromSocials(socials));

  return {
    ...settings,
    socials: {
      instagram: asString(socials.instagram),
      twitter: asString(socials.twitter),
      youtube: asString(socials.youtube),
      aboutPage: normalizeAboutPage(socials.aboutPage),
      navigation: normalizeHeaderNavigation(socials.navigation),
      mail,
    },
  };
}

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);

    let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "main",
          siteName: "Chronos",
          socials: {
            instagram: "",
            twitter: "",
            youtube: "",
            aboutPage: normalizeAboutPage(undefined),
            navigation: normalizeHeaderNavigation(undefined),
            mail: resolveMailSettingsUpdate(getStoredMailSettingsFromSocials(undefined), undefined),
          } as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json(sanitizeSettingsResponse(settings));
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

    const existing = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    const incomingSocials = toSocialsObject(data.socials);
    const existingSocials = toSocialsObject(existing?.socials);
    const mailUpdate = (data.mail || incomingSocials.mail || null) as MailSettingsUpdateInput | null;

    const normalizedSocials = normalizeSocialsForStorage({
      incomingSocials,
      existingSocials,
      mailUpdate,
    });

    const mail = toPublicMailSettings(
      getStoredMailSettingsFromSocials(normalizedSocials as unknown as SocialsPayload),
    );

    if (mail.enabled && !mail.fromEmail.includes("@")) {
      return NextResponse.json(
        { error: "From email is required and must be valid when mail delivery is enabled." },
        { status: 400 },
      );
    }
    if (mail.enabled && mail.provider === "gmail" && !mail.smtpUser.includes("@")) {
      return NextResponse.json(
        { error: "Gmail SMTP user must be a valid Gmail address when Gmail provider is enabled." },
        { status: 400 },
      );
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: {
        siteName: data.siteName,
        logo: data.logo,
        socials: normalizedSocials,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        footerText: data.footerText,
        analyticsId: data.analyticsId,
      },
      create: {
        id: "main",
        siteName: data.siteName || "Chronos",
        logo: data.logo || "",
        socials: normalizedSocials,
        seoTitle: data.seoTitle || "",
        seoDescription: data.seoDescription || "",
        ogImage: data.ogImage || "",
        footerText: data.footerText || "",
        analyticsId: data.analyticsId || "",
      },
    });

    clearRuntimeMailSettingsCache();
    return NextResponse.json(sanitizeSettingsResponse(settings));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 400
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
