import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, type Locale, toLocaleTag } from "./config";
import en from "./dictionaries/en";
import tr from "./dictionaries/tr";
import { getLocaleFromPathname, getPreferredLocale, localizeHref } from "./routing";

type DeepWiden<T> =
  T extends string ? string :
  T extends readonly (infer Item)[] ? readonly DeepWiden<Item>[] :
  T extends object ? { [K in keyof T]: DeepWiden<T[K]> } :
  T;

export type Dictionary = DeepWiden<typeof en>;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  tr,
};

function parsePathFromHeader(value: string | null): string | null {
  if (!value) return null;

  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return new URL(value).pathname;
    }
  } catch {
    return null;
  }

  return value.startsWith("/") ? value : null;
}

export async function getLocale(): Promise<Locale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-locale");
  if (isLocale(headerLocale)) return headerLocale;

  const headerPathCandidates = [
    headerStore.get("x-pathname"),
    headerStore.get("x-invoke-path"),
    headerStore.get("x-matched-path"),
    headerStore.get("next-url"),
    headerStore.get("x-next-url"),
  ];

  for (const candidate of headerPathCandidates) {
    const parsedPath = parsePathFromHeader(candidate);
    if (!parsedPath) continue;
    const localeFromPath = getLocaleFromPathname(parsedPath);
    if (localeFromPath) return localeFromPath;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  return getPreferredLocale(headerStore.get("accept-language")) || DEFAULT_LOCALE;
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  const resolved = locale || await getLocale();
  return dictionaries[resolved];
}

export function getLocaleTag(locale: Locale) {
  return toLocaleTag(locale);
}

export function resolveLocalizedLabel(type: "category" | "segment", value: string, dictionary: Dictionary): string {
  if (type === "category" && value.toLowerCase() === "all") return dictionary.blog.allCategory;
  if (type === "segment" && value.toLowerCase() === "all") return dictionary.brands.all;
  return value;
}

export function localizeRoute(href: string, locale: Locale) {
  return localizeHref(href, locale);
}
