"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";

const SESSION_STORAGE_KEY = "chronos_metric_session_id";

function getSessionId() {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

async function sendMetric(payload: Record<string, unknown>) {
  try {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Ignore metric transport failures.
  }
}

export default function PageMetrics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useI18n();

  useEffect(() => {
    const sessionId = getSessionId();
    const search = searchParams.toString();
    const pathWithQuery = search ? `${pathname}?${search}` : pathname;

    void sendMetric({
      type: "PAGE_VIEW",
      sessionId,
      locale,
      path: pathWithQuery,
      referrer: document.referrer || null,
    });

    if (pathname.includes("/search")) {
      const q = searchParams.get("q");
      if (q) {
        void sendMetric({
          type: "SEARCH_QUERY",
          sessionId,
          locale,
          path: pathWithQuery,
          metadata: {
            queryLength: q.length,
            hasFilters:
              Boolean(searchParams.get("type")) ||
              Boolean(searchParams.get("category")) ||
              Boolean(searchParams.get("brand")),
          },
        });
      }
    }
  }, [locale, pathname, searchParams]);

  return null;
}
