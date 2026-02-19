import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/admin/SettingsClient";
import { normalizeAboutPage } from "@/lib/about-page";
import { normalizeHeaderNavigation } from "@/lib/navigation";
import { getStoredMailSettingsFromSocials, toPublicMailSettings } from "@/lib/mail-settings";

export default async function SettingsPage() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) settings = await prisma.siteSettings.create({ data: { id: "main", siteName: "Chronos" } });

  const socials =
    settings.socials && typeof settings.socials === "object"
      ? (settings.socials as {
          instagram?: unknown;
          twitter?: unknown;
          youtube?: unknown;
          aboutPage?: unknown;
          navigation?: unknown;
        })
      : {};

  const safeSettings = {
    ...settings,
    socials: {
      instagram: typeof socials.instagram === "string" ? socials.instagram : "",
      twitter: typeof socials.twitter === "string" ? socials.twitter : "",
      youtube: typeof socials.youtube === "string" ? socials.youtube : "",
      aboutPage: normalizeAboutPage(socials.aboutPage),
      navigation: normalizeHeaderNavigation(socials.navigation),
      mail: toPublicMailSettings(getStoredMailSettingsFromSocials(socials)),
    },
  };

  return <SettingsClient settings={safeSettings} />;
}
