"use client";

import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { ADSENSE_CLIENT_ID, isAdsenseReady, resolveAdSlot } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

type AdSlotProps = {
  slot: string;
  className?: string;
  label?: string;
  style?: CSSProperties;
};

export default function AdSlot({
  slot,
  className = "",
  label = "Advertisement",
  style,
}: AdSlotProps) {
  const initializedRef = useRef(false);
  const resolvedSlot = useMemo(() => resolveAdSlot(slot), [slot]);

  useEffect(() => {
    if (!isAdsenseReady() || !resolvedSlot || initializedRef.current) return;
    if (typeof window === "undefined") return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initializedRef.current = true;
    } catch {
      // AdSense can throw if script is blocked or not ready; fail silently.
    }
  }, [resolvedSlot]);

  if (!isAdsenseReady() || !resolvedSlot) return null;

  return (
    <aside className={`my-8 ${className}`}>
      <p className="text-[10px] uppercase tracking-[1.8px] text-[var(--text-light)] mb-2">
        {label}
      </p>
      <ins
        className="adsbygoogle block min-h-[90px] rounded-md border border-[var(--border)] bg-[var(--bg-off)]"
        style={{ display: "block", ...style }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={resolvedSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
