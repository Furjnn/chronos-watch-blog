"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

interface Slide {
  id: string;
  badge: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
}

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const { t, localizePath } = useI18n();
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const DURATION = 6000;

  const goTo = useCallback((i: number) => { setCurrent(i); setProgress(0); }, []);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => { if (p >= 100) { next(); return 0; } return p + (100 / (DURATION / 50)); });
    }, 50);
    return () => clearInterval(iv);
  }, [current, next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-[var(--navy)]" style={{ height: "85vh", minHeight: 540, maxHeight: 780 }}>
      {/* Background images */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[900ms]"
          style={{
            backgroundImage: `url(${s.image})`,
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.06)",
            transition: "opacity 0.9s ease, transform 6s ease-out",
          }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.75) 100%)" }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-6 md:px-10 pb-16 md:pb-[72px]">
        <div key={current} style={{ animation: "fade-in-up 0.7s ease-out" }}>
          <div className="inline-block px-5 py-1.5 mb-6 border border-[var(--gold)] text-[var(--gold)] text-[10px] font-semibold tracking-[3px] uppercase">
            {slide.badge}
          </div>

          <h1 className="text-white leading-[1.1] mb-4 max-w-[700px] mx-auto" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400 }}>
            {slide.title}
          </h1>

          <p className="text-white/70 text-[15px] leading-relaxed max-w-[500px] mx-auto mb-8">
            {slide.excerpt}
          </p>

          <Link
            href={localizePath(`/blog/${slide.slug}`)}
            className="inline-block px-10 py-3.5 bg-white text-[var(--charcoal)] text-[11px] font-semibold tracking-[2.5px] uppercase no-underline hover:bg-[var(--gold)] hover:text-white transition-all"
          >
            {t("home.heroReadMore", "READ MORE")}
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 mt-12">
          <button onClick={prev} className="w-10 h-10 flex items-center justify-center border border-white/20 bg-transparent text-white cursor-pointer hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative overflow-hidden border-none cursor-pointer p-0"
                style={{ width: i === current ? 40 : 8, height: 3, background: i === current ? "transparent" : "rgba(255,255,255,0.3)", transition: "width 0.4s ease", borderRadius: 1 }}
              >
                {i === current && (
                  <>
                    <div className="absolute inset-0 bg-white/20" />
                    <div className="absolute top-0 left-0 bottom-0 bg-[var(--gold)]" style={{ width: `${progress}%`, transition: "width 0.05s linear" }} />
                  </>
                )}
              </button>
            ))}
          </div>

          <button onClick={next} className="w-10 h-10 flex items-center justify-center border border-white/20 bg-transparent text-white cursor-pointer hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-10 text-center hidden md:block">
        <div className="text-[var(--gold)] text-4xl font-light" style={{ fontFamily: "var(--font-display)" }}>
          {String(current + 1).padStart(2, "0")}
        </div>
        <div className="w-px h-7 bg-white/20 mx-auto my-1.5" />
        <div className="text-white/35 text-[12px]">{String(slides.length).padStart(2, "0")}</div>
      </div>
    </section>
  );
}
