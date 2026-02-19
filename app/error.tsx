"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t, localizePath } = useI18n();

  return (
    <section className="pt-14 min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center px-6 max-w-[560px]">
        <div className="text-[11px] font-semibold tracking-[2px] uppercase text-[var(--gold)] mb-3">{t("error.badge", "Unexpected Error")}</div>
        <h1 className="text-4xl font-normal text-[var(--charcoal)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {t("error.title", "Something went wrong")}
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-8">{error.message || t("error.fallback", "The page failed to load. Please try again.")}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-7 py-3 bg-[var(--charcoal)] text-white text-[12px] font-semibold tracking-[1.5px] uppercase border-none cursor-pointer"
          >
            {t("error.tryAgain", "Try Again")}
          </button>
          <Link
            href={localizePath("/")}
            className="px-7 py-3 border border-[var(--border)] text-[12px] font-semibold tracking-[1.5px] uppercase no-underline text-[var(--text-secondary)]"
          >
            {t("error.goHome", "Go Home")}
          </Link>
        </div>
      </div>
    </section>
  );
}
