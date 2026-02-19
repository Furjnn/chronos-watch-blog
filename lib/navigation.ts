import type { Locale } from "@/lib/i18n/config";

export interface HeaderNavigationItem {
  id: string;
  labelEn: string;
  labelTr: string;
  href: string;
  external: boolean;
  enabled: boolean;
}

export const DEFAULT_HEADER_NAVIGATION: HeaderNavigationItem[] = [
  {
    id: "latest",
    labelEn: "Latest",
    labelTr: "Son Yazilar",
    href: "/blog",
    external: false,
    enabled: true,
  },
  {
    id: "reviews",
    labelEn: "Reviews",
    labelTr: "Incelemeler",
    href: "/reviews",
    external: false,
    enabled: true,
  },
  {
    id: "brands",
    labelEn: "Brands",
    labelTr: "Markalar",
    href: "/brands",
    external: false,
    enabled: true,
  },
  {
    id: "vintage",
    labelEn: "Vintage",
    labelTr: "Vintage",
    href: "/blog?category=vintage",
    external: false,
    enabled: true,
  },
  {
    id: "about",
    labelEn: "About",
    labelTr: "Hakkimizda",
    href: "/about",
    external: false,
    enabled: true,
  },
];

function asNonEmptyString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function looksExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href);
}

function sanitizeHref(href: string, fallback: string) {
  const normalized = href.trim();
  if (!normalized) return fallback;

  if (looksExternalHref(normalized)) return normalized;
  if (normalized.startsWith("/")) return normalized;

  return `/${normalized}`;
}

function toNavigationItem(value: unknown, index: number): HeaderNavigationItem | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<HeaderNavigationItem>;
  const base = DEFAULT_HEADER_NAVIGATION[index] || DEFAULT_HEADER_NAVIGATION[0];
  const href = sanitizeHref(asNonEmptyString(raw.href, base.href), base.href);
  const external = asBoolean(raw.external, looksExternalHref(href));

  return {
    id: asNonEmptyString(raw.id, `nav-${index + 1}`),
    labelEn: asNonEmptyString(raw.labelEn, base.labelEn),
    labelTr: asNonEmptyString(raw.labelTr, base.labelTr),
    href,
    external,
    enabled: asBoolean(raw.enabled, true),
  };
}

export function normalizeHeaderNavigation(input: unknown): HeaderNavigationItem[] {
  if (!Array.isArray(input)) {
    return DEFAULT_HEADER_NAVIGATION;
  }

  const normalized = input
    .map((item, index) => toNavigationItem(item, index))
    .filter((item): item is HeaderNavigationItem => Boolean(item))
    .slice(0, 12);

  if (normalized.length === 0) return DEFAULT_HEADER_NAVIGATION;

  const seen = new Set<string>();
  return normalized.map((item, index) => {
    const id = seen.has(item.id) ? `${item.id}-${index + 1}` : item.id;
    seen.add(id);
    return { ...item, id };
  });
}

export function extractHeaderNavigationFromSocials(socials: unknown) {
  if (!socials || typeof socials !== "object") return DEFAULT_HEADER_NAVIGATION;
  const payload = socials as { navigation?: unknown };
  return normalizeHeaderNavigation(payload.navigation);
}

export function getNavigationLabel(item: HeaderNavigationItem, locale: Locale) {
  return locale === "tr" ? item.labelTr : item.labelEn;
}

