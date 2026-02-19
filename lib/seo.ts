const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "http://localhost:3000";

export const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export function absoluteUrl(pathname = "/") {
  if (!pathname.startsWith("/")) {
    return `${siteUrl}/${pathname}`;
  }
  return `${siteUrl}${pathname}`;
}
