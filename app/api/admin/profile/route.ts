import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { getRequestContext } from "@/lib/request-context";

type ProfileSocialLinks = {
  website: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  github: string;
};

type UserProfileRow = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  profileCoverImage: string | null;
  profileTitle: string | null;
  profileBio: string | null;
  profileDetails: string | null;
  profilePhone: string | null;
  profileLocation: string | null;
  profileTimezone: string | null;
  profileWebsite: string | null;
  profileSocialLinks: Prisma.JsonValue | null;
  updatedAt: Date;
};

function asString(value: unknown, max = 255) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function asText(value: unknown, max = 8000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function readSocialLinks(value: unknown): ProfileSocialLinks {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    website: asString(source.website, 300),
    twitter: asString(source.twitter, 300),
    instagram: asString(source.instagram, 300),
    linkedin: asString(source.linkedin, 300),
    youtube: asString(source.youtube, 300),
    github: asString(source.github, 300),
  };
}

function toProfileResponse(user: UserProfileRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || "",
    profileCoverImage: user.profileCoverImage || "",
    profileTitle: user.profileTitle || "",
    profileBio: user.profileBio || "",
    profileDetails: user.profileDetails || "",
    profilePhone: user.profilePhone || "",
    profileLocation: user.profileLocation || "",
    profileTimezone: user.profileTimezone || "",
    profileWebsite: user.profileWebsite || "",
    profileSocialLinks: readSocialLinks(user.profileSocialLinks),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        profileCoverImage: true,
        profileTitle: true,
        profileBio: true,
        profileDetails: true,
        profilePhone: true,
        profileLocation: true,
        profileTimezone: true,
        profileWebsite: true,
        profileSocialLinks: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: toProfileResponse(user) });
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
    const session = await requireAuth();
    const context = getRequestContext(req);
    const data = await req.json();

    const name = asString(data.name, 120);
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const socialLinks = readSocialLinks(data.profileSocialLinks);

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        name,
        avatar: asString(data.avatar, 512) || null,
        profileCoverImage: asString(data.profileCoverImage, 512) || null,
        profileTitle: asString(data.profileTitle, 120) || null,
        profileBio: asText(data.profileBio, 2500) || null,
        profileDetails: asText(data.profileDetails, 10000) || null,
        profilePhone: asString(data.profilePhone, 80) || null,
        profileLocation: asString(data.profileLocation, 120) || null,
        profileTimezone: asString(data.profileTimezone, 80) || null,
        profileWebsite: asString(data.profileWebsite, 300) || null,
        profileSocialLinks: socialLinks as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        profileCoverImage: true,
        profileTitle: true,
        profileBio: true,
        profileDetails: true,
        profilePhone: true,
        profileLocation: true,
        profileTimezone: true,
        profileWebsite: true,
        profileSocialLinks: true,
        updatedAt: true,
      },
    });

    await logAuditEvent({
      action: "admin_profile.updated",
      entityType: "user",
      entityId: user.id,
      summary: `Updated own profile: ${user.email}`,
      actor: { userId: session.id },
      details: {
        hasAvatar: Boolean(user.avatar),
        hasCoverImage: Boolean(user.profileCoverImage),
        hasBio: Boolean(user.profileBio),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return NextResponse.json({ user: toProfileResponse(user) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 400
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
