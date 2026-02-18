/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const config = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: ["/admin/*", "/api/*", "/studio/*"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
  },
};

export default config;
