"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

interface Category {
  name: string;
  count: number;
  icon: string;
}

export function Categories({ categories }: { categories: Category[] }) {
  const { t } = useI18n();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-[72px] bg-[var(--bg-off)]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 text-center">
        <h2 className="text-[34px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>{t("home.categories.title", "Explore by Category")}</h2>
        <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mb-10" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.name}
              className="py-7 px-5 cursor-pointer text-center transition-all duration-300"
              style={{
                background: hoveredIdx === i ? "var(--charcoal)" : "var(--bg)",
                border: hoveredIdx === i ? "1px solid var(--charcoal)" : "1px solid var(--border)",
                transform: hoveredIdx === i ? "translateY(-3px)" : "none",
                boxShadow: hoveredIdx === i ? "0 8px 24px rgba(0,0,0,0.08)" : "none",
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="text-[22px] mb-2.5 transition-transform" style={{ transform: hoveredIdx === i ? "scale(1.15)" : "scale(1)", color: hoveredIdx === i ? "var(--gold)" : "var(--text-light)" }}>
                {cat.icon}
              </div>
              <div className="text-[17px] font-medium mb-1 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredIdx === i ? "#fff" : "var(--charcoal)" }}>
                {cat.name}
              </div>
              <div className="text-[12px] transition-colors" style={{ color: hoveredIdx === i ? "rgba(255,255,255,0.5)" : "var(--text-light)" }}>
                {cat.count} {t("home.categories.articlesSuffix", "articles")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
