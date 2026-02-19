"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import en from "@/lib/i18n/dictionaries/en";
import { localizeHref } from "@/lib/i18n/routing";

type I18nContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (path: string, fallback?: string) => string;
  localizePath: (href: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const t = useCallback((path: string, fallback = "") => {
    const value = getByPath(dictionary, path);
    return typeof value === "string" ? value : fallback;
  }, [dictionary]);

  const localizePath = useCallback((href: string) => localizeHref(href, locale), [locale]);

  const contextValue = useMemo(
    () => ({ locale, dictionary, t, localizePath }),
    [dictionary, locale, localizePath, t],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context) return context;

  return {
    locale: "en" as Locale,
    dictionary: en as Dictionary,
    t: (path: string, fallback = "") => {
      const value = getByPath(en, path);
      return typeof value === "string" ? value : fallback;
    },
    localizePath: (href: string) => localizeHref(href, "en"),
  };
}
