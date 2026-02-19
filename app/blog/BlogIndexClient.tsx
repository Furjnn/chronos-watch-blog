"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/I18nProvider";
import AdSlot from "@/components/ads/AdSlot";
import { ADSENSE_SLOTS } from "@/lib/ads";

interface Post {
  id: string;
  cat: string;
  title: string;
  excerpt: string;
  author: string;
  avatar: string;
  date: string;
  readTime: string;
  img: string;
  slug: string;
}

const catColor: Record<string, string> = {
  review: "#2D6A4F",
  guide: "#7B2D8B",
  heritage: "#B8956A",
  technical: "#2563EB",
  vintage: "#9A3412",
  interview: "#0F766E",
  culture: "#B91C1C",
  news: "#1E40AF",
};

function getCategoryKey(category: string) {
  return category.trim().toLowerCase();
}

export default function BlogIndexClient({ posts, categories, initialCategory }: { posts: Post[]; categories: string[]; initialCategory: string }) {
  const { t, localizePath } = useI18n();
  const allCategory = categories[0] || t("blog.allCategory", "All");
  const [activeCat, setActiveCat] = useState(categories.includes(initialCategory) ? initialCategory : allCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const perPage = 6;
  const filtered = activeCat === allCategory ? posts : posts.filter((post) => post.cat === activeCat);
  const totalPages = Math.ceil(filtered.length / perPage);
  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div>
      <section className="pt-14 bg-[var(--bg-warm)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-14 pb-10">
          <div className="text-[12px] text-[var(--text-light)] mb-5">
            <Link href={localizePath("/")} className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">
              {t("common.home", "Home")}
            </Link>
            <span className="mx-2 text-[var(--border)]">/</span>
            <span className="text-[var(--text)]">{t("common.blog", "Blog")}</span>
          </div>
          <h1 className="text-[42px] font-normal text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {t("blog.title", "The Journal")}
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] max-w-[520px]">
            {t("blog.subtitle", "In-depth reviews, stories, and insights from the world of horology")}
          </p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mt-5" />
        </div>
      </section>

      <section className="bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex gap-0 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCat(category);
                setCurrentPage(1);
              }}
              className="text-[12px] font-medium tracking-[0.5px] py-4 px-5 border-none cursor-pointer transition-all whitespace-nowrap bg-transparent"
              style={{
                color: activeCat === category ? "var(--charcoal)" : "var(--text-light)",
                borderBottom: activeCat === category ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="py-10 bg-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <AdSlot slot={ADSENSE_SLOTS.blogListInline} />
          {visible.length === 0 ? (
            <p className="text-center text-[var(--text-light)] py-20">{t("blog.noCategoryPosts", "No articles found in this category yet.")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {visible.map((post) => (
                <Link
                  key={post.id}
                  href={localizePath(`/blog/${post.slug}`)}
                  className="no-underline transition-transform duration-300"
                  style={{ transform: hoveredId === post.id ? "translateY(-3px)" : "none" }}
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: "4/3" }}>
                    <Image
                      src={post.img}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500"
                      style={{ transform: hoveredId === post.id ? "scale(1.04)" : "scale(1)" }}
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-2.5 py-1 text-white"
                        style={{ background: catColor[getCategoryKey(post.cat)] || "#777" }}
                      >
                        {post.cat}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="text-[19px] font-medium leading-tight mb-2 transition-colors"
                    style={{ fontFamily: "var(--font-display)", color: hoveredId === post.id ? "var(--gold-dark)" : "var(--charcoal)" }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <div
                      className="w-[26px] h-[26px] rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[11px] font-semibold text-[var(--charcoal)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {post.avatar}
                    </div>
                    <span className="text-[var(--text-secondary)]">{post.author}</span>
                    <span className="text-[var(--border)]">&middot;</span>
                    <span className="text-[var(--text-light)]">{post.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-12">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-9 h-9 flex items-center justify-center text-[13px] font-medium cursor-pointer transition-all"
                  style={{
                    border: page === currentPage ? "1px solid var(--charcoal)" : "1px solid var(--border)",
                    background: page === currentPage ? "var(--charcoal)" : "var(--bg)",
                    color: page === currentPage ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
