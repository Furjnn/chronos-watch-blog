import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "@/components/admin/ProfileClient";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readSocialLinks(value: unknown) {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    website: asString(source.website),
    twitter: asString(source.twitter),
    instagram: asString(source.instagram),
    linkedin: asString(source.linkedin),
    youtube: asString(source.youtube),
    github: asString(source.github),
  };
}

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

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
    redirect("/admin/login");
  }

  return (
    <ProfileClient
      initialProfile={{
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
      }}
    />
  );
}
