import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/admin/SettingsClient";

export default async function SettingsPage() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings) settings = await prisma.siteSettings.create({ data: { id: "main", siteName: "Chronos" } });
  return <SettingsClient settings={{ ...settings, updatedAt: settings.updatedAt.toISOString() }} />;
}
