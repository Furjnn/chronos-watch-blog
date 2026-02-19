"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/I18nProvider";

interface Brand {
  name: string;
  country: string;
  segment: string;
  founded: number;
  articles: number;
  img: string;
  slug: string;
}

type SegmentOption = {
  value: string;
  label: string;
};

const segmentColor: Record<string, string> = {
  entry: "#2563EB",
  "mid-range": "#0F766E",
  luxury: "#B8956A",
  "ultra-luxury": "#7B2D8B",
};

function getSegmentKey(segment: string) {
  return segment.trim().toLowerCase();
}

function localizeSegment(segment: string, t: (path: string, fallback?: string) => string) {
  const key = getSegmentKey(segment);
  if (key === "entry") return t("brands.segmentEntry", "Entry");
  if (key === "mid-range") return t("brands.segmentMidRange", "Mid-Range");
  if (key === "luxury") return t("brands.segmentLuxury", "Luxury");
  if (key === "ultra-luxury") return t("brands.segmentUltraLuxury", "Ultra-Luxury");
  return segment;
}

export default function BrandsClient({ brands }: { brands: Brand[] }) {
  const { t, localizePath } = useI18n();
  const allValue = "__all__";
  const [activeSegment, setActiveSegment] = useState(allValue);
  const [hovered, setHovered] = useState<string | null>(null);

  const segments = useMemo<SegmentOption[]>(() => {
    const uniqueSegments = Array.from(new Set(brands.map((brand) => brand.segment)));
    return [
      { value: allValue, label: t("brands.all", "All") },
      ...uniqueSegments.map((segment) => ({ value: segment, label: localizeSegment(segment, t) })),
    ];
  }, [brands, t]);

  const filtered =
    activeSegment === allValue
      ? brands
      : brands.filter((brand) => brand.segment === activeSegment);

  return (
    <div>
      <section className="pt-14 bg-[var(--navy)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center">
          <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-3">{t("brands.badge", "Directory")}</div>
          <h1 className="text-[48px] font-normal text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {t("brands.title", "Watch Brands")}
          </h1>
          <p className="text-[15px] text-white/50 max-w-[500px] mx-auto">{t("brands.subtitle", "Explore the world's finest watchmakers")}</p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-6" />
        </div>
      </section>

      <section className="bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex justify-center gap-0">
          {segments.map((segmentOption) => (
            <button
              key={segmentOption.value}
              onClick={() => setActiveSegment(segmentOption.value)}
              className="text-[12px] font-medium tracking-[0.5px] py-4 px-6 border-none cursor-pointer transition-all bg-transparent"
              style={{
                color: activeSegment === segmentOption.value ? "var(--charcoal)" : "var(--text-light)",
                borderBottom: activeSegment === segmentOption.value ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              {segmentOption.label}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12 bg-[var(--bg-off)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {filtered.length === 0 ? (
            <p className="text-center text-[var(--text-light)] py-20">{t("brands.noBrands", "No brands found.")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((brand) => (
                <Link
                  key={brand.name}
                  href={localizePath(`/brands/${brand.slug}`)}
                  className="bg-[var(--bg)] border border-[var(--border)] overflow-hidden no-underline transition-all duration-300"
                  style={{
                    transform: hovered === brand.name ? "translateY(-4px)" : "none",
                    boxShadow: hovered === brand.name ? "0 12px 32px rgba(0,0,0,0.06)" : "none",
                  }}
                  onMouseEnter={() => setHovered(brand.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="h-[180px] overflow-hidden relative">
                    <Image
                      src={brand.img}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500"
                      style={{ transform: hovered === brand.name ? "scale(1.05)" : "scale(1)" }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                    <div className="absolute bottom-3.5 left-4">
                      <span
                        className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-2.5 py-1 text-white"
                        style={{ background: segmentColor[getSegmentKey(brand.segment)] || "#777" }}
                      >
                        {localizeSegment(brand.segment, t)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[24px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                        {brand.name}
                      </h3>
                      {brand.founded > 0 && <span className="text-[11px] text-[var(--text-light)]">{t("brands.est", "Est.")} {brand.founded}</span>}
                    </div>
                    <div className="text-[12px] text-[var(--text-light)] mb-4">{brand.country}</div>
                    <div className="flex items-center justify-between pt-3.5 border-t border-[var(--border)]">
                      <span className="text-[12px] text-[var(--text-light)]">{brand.articles} {t("common.articles", "articles")}</span>
                      <span className="text-[11px] font-semibold tracking-[1px] uppercase transition-colors" style={{ color: hovered === brand.name ? "var(--gold)" : "var(--text-secondary)" }}>
                        {t("brands.explore", "Explore")} -&gt;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
