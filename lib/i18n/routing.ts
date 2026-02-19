import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, type Locale } from "./config";

export function getLocaleFromPathname(pathname: string): Locale | null {
  const firstSegment = pathname.split("/")[1];
  return isLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname || "/";

  const stripped = pathname.slice(locale.length + 1);
  return stripped.length > 0 ? stripped : "/";
}

export function localizePathname(pathname: string, locale: Locale): string {
  const normalized = stripLocaleFromPathname(pathname || "/");
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

export function localizeHref(href: string, locale: Locale): string {
  if (!href) return localizePathname("/", locale);
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;

  const [withoutHash, hash] = href.split("#");
  const [pathname, query] = withoutHash.split("?");
  const localizedPath = localizePathname(pathname || "/", locale);

  let result = localizedPath;
  if (query) result += `?${query}`;
  if (hash) result += `#${hash}`;
  return result;
}

export function switchLocaleInPathname(pathname: string, nextLocale: Locale): string {
  return localizePathname(stripLocaleFromPathname(pathname), nextLocale);
}

export function getPreferredLocale(acceptLanguageHeader: string | null | undefined): Locale {
  if (acceptLanguageHeader) {
    const normalized = acceptLanguageHeader.toLowerCase();
    if (normalized.startsWith("tr") || normalized.includes(",tr")) return "tr";
  }
  return DEFAULT_LOCALE;
}

export function buildLanguageAlternates(pathname: string) {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, localizePathname(pathname, locale)]),
  ) as Record<Locale, string>;

  return {
    ...languages,
    "x-default": localizePathname(pathname, DEFAULT_LOCALE),
  };
}
