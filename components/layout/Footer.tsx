"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

export function Footer() {
  const { t, localizePath } = useI18n();

  const footerCols = [
    {
      title: t("footer.explore", "Explore"),
      links: [
        { label: t("footer.latestArticles", "Latest Articles"), href: localizePath("/blog") },
        { label: t("footer.watchReviews", "Watch Reviews"), href: localizePath("/reviews") },
        { label: t("footer.brandGuides", "Brand Guides"), href: localizePath("/brands") },
        { label: t("footer.vintageWatches", "Vintage Watches"), href: localizePath("/blog?category=vintage") },
      ],
    },
    {
      title: t("footer.about", "About"),
      links: [
        { label: t("footer.ourStory", "Our Story"), href: localizePath("/about") },
        { label: t("footer.editorialTeam", "Editorial Team"), href: localizePath("/about") },
        { label: t("footer.contactUs", "Contact Us"), href: localizePath("/about") },
        { label: t("footer.advertise", "Advertise"), href: localizePath("/about") },
      ],
    },
  ];

  return (
    <footer className="bg-[#111] pt-14 pb-0">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 pb-12">
          <div>
            <div className="text-xl font-semibold text-white tracking-[2px] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              CHRONOS
            </div>
            <p className="text-[13px] text-white/35 leading-relaxed max-w-[260px]">
              {t("footer.brandDescription", "Your trusted source for luxury watch reviews, news, and insights.")}
            </p>
            <div className="flex gap-2.5 mt-5">
              {["Instagram", "Twitter", "YouTube", "Pinterest"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-[34px] h-[34px] flex items-center justify-center border border-white/10 text-white/35 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
                  title={s}
                >
                  <span className="text-[10px] font-bold">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-semibold tracking-[2px] uppercase text-[var(--gold)] mb-5">
                {col.title}
              </div>
              <div className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[13px] text-white/40 no-underline hover:text-white/80 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="text-[11px] font-semibold tracking-[2px] uppercase text-[var(--gold)] mb-5">
              {t("footer.connect", "Connect")}
            </div>
            <p className="text-[13px] text-white/35 leading-relaxed mb-4">
              {t("footer.connectText", "Subscribe for weekly watch reviews and insider insights.")}
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder", "your@email.com")}
                className="flex-1 px-3 py-2.5 border border-white/10 bg-white/5 text-white text-[13px] outline-none"
              />
              <button className="px-4 py-2.5 bg-[var(--gold)] text-white text-[11px] font-bold tracking-[1.5px] uppercase border-none cursor-pointer hover:bg-[var(--gold-light)] transition-colors">
                {t("footer.go", "Go")}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[12px] text-white/20">{t("footer.rights", "(c) 2026 Chronos. All rights reserved.")}</span>
          <div className="flex gap-6">
            {[
              t("footer.privacy", "Privacy Policy"),
              t("footer.terms", "Terms of Service"),
              t("footer.cookie", "Cookie Policy"),
            ].map((l) => (
              <Link key={l} href="#" className="text-[12px] text-white/20 no-underline hover:text-white/50 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
