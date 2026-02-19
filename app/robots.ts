import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/account",
          "/submit",
          "/search",
          "/en/account",
          "/tr/account",
          "/en/submit",
          "/tr/submit",
          "/en/search",
          "/tr/search",
        ],
      },
    ],
    host: siteUrl,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
