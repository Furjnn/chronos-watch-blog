"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n/I18nProvider";
import { getLocaleFromPathname, switchLocaleInPathname } from "@/lib/i18n/routing";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const localeFromPath = getLocaleFromPathname(pathname || "/");
  const effectiveLocale = localeFromPath || locale;
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  const selectedLocale = pendingLocale && pendingLocale !== effectiveLocale
    ? pendingLocale
    : effectiveLocale;

  const updateLocale = async (nextLocale: Locale) => {
    if (nextLocale === effectiveLocale) return;

    setPendingLocale(nextLocale);

    const currentPathname = typeof window !== "undefined" ? window.location.pathname : pathname || "/";
    const currentSearch = typeof window !== "undefined"
      ? window.location.search
      : (searchParams.toString() ? `?${searchParams.toString()}` : "");

    const nextPathname = switchLocaleInPathname(currentPathname, nextLocale);
    const nextUrl = `${nextPathname}${currentSearch}`;

    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    }

    // Keep API cookie sync as a best-effort fallback for SSR/Edge consistency.
    fetch("/api/i18n/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
        keepalive: true,
      }).catch(() => undefined);

    if (typeof window !== "undefined") {
      window.location.assign(nextUrl);
      return;
    }
  };

  const selectClass = compact
    ? "text-[11px] px-2 py-1.5 rounded-md border bg-transparent"
    : "text-[12px] px-2.5 py-1.5 rounded-md border bg-transparent";

  return (
    <div className="flex items-center gap-1.5">
      {!compact && (
        <span className="text-[10px] uppercase tracking-[1px] text-[var(--text-light)]">
          {t("localeSwitcher.label", "Language")}
        </span>
      )}
      <select
        aria-label={t("localeSwitcher.label", "Language")}
        value={selectedLocale}
        onChange={(e) => updateLocale(e.target.value as Locale)}
        className={`${selectClass} border-[var(--border)] text-[var(--text-secondary)]`}
      >
        <option value="en">{t("localeSwitcher.en", "EN")}</option>
        <option value="tr">{t("localeSwitcher.tr", "TR")}</option>
      </select>
    </div>
  );
}
