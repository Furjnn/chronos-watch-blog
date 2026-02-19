"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import { ADSENSE_CLIENT_ID, isAdsenseReady } from "@/lib/ads";

const EXCLUDED_PREFIXES = ["/admin", "/account", "/submit"];

export default function AdSenseScript() {
  const pathname = usePathname();
  const normalizedPath = stripLocaleFromPathname(pathname || "/");
  const isExcluded = EXCLUDED_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  if (!isAdsenseReady() || isExcluded) {
    return null;
  }

  return (
    <Script
      id="google-adsense-script"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
    />
  );
}
