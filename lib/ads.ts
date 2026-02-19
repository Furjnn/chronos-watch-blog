export const ADSENSE_ENABLED = (() => {
  const flag = (process.env.NEXT_PUBLIC_ADSENSE_ENABLED || "").trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
})();

export const ADSENSE_CLIENT_ID = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "").trim();

export const ADSENSE_SLOTS = {
  generic: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_GENERIC || "").trim(),
  homeTop: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP || "").trim(),
  blogListInline: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LIST_INLINE || "").trim(),
  blogPostInline: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_POST_INLINE || "").trim(),
  reviewsListInline: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_REVIEWS_LIST_INLINE || "").trim(),
  reviewDetailInline: (process.env.NEXT_PUBLIC_ADSENSE_SLOT_REVIEW_DETAIL_INLINE || "").trim(),
} as const;

export function resolveAdSlot(slot: string) {
  return slot || ADSENSE_SLOTS.generic || "";
}

export function isAdsenseReady() {
  return ADSENSE_ENABLED && ADSENSE_CLIENT_ID.startsWith("ca-pub-");
}
