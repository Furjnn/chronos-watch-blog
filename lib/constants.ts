// ═══ src/lib/constants.ts ═══

export const SITE_NAME = "Chronos";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chronos-watch.blog";
export const SITE_DESCRIPTION = "Your trusted source for luxury watch reviews, news, and insights.";

export const NAV_ITEMS = [
  { label: "Latest", href: "/blog" },
  { label: "Reviews", href: "/reviews" },
  { label: "Brands", href: "/brands" },
  { label: "Vintage", href: "/blog?category=vintage" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_LINKS = {
  explore: [
    { label: "Latest Articles", href: "/blog" },
    { label: "Watch Reviews", href: "/reviews" },
    { label: "Brand Guides", href: "/brands" },
    { label: "Vintage Watches", href: "/blog?category=vintage" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Editorial Team", href: "/about#team" },
    { label: "Contact Us", href: "/contact" },
    { label: "Advertise", href: "/contact?subject=advertising" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
  ],
};

export const POSTS_PER_PAGE = 12;
export const REVIEWS_PER_PAGE = 9;

export const REVALIDATE_INTERVAL = {
  home: 60,
  list: 60,
  detail: 3600,
  static: 86400,
} as const;
