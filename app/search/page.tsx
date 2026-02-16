"use client";

import { useState } from "react";
import Link from "next/link";

const RESULTS = [
  { id: "1", type: "Article", title: "The New Submariner: A Deep Dive", excerpt: "An in-depth look at the latest iteration of the iconic diving watch.", date: "Feb 14, 2026", readTime: "8 min", img: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=300&q=80", slug: "/blog/new-submariner" },
  { id: "2", type: "Review", title: "Rolex Submariner 126610LN Review", excerpt: "Comprehensive review — specs, wrist time impressions, and final verdict.", date: "Feb 10, 2026", readTime: "14 min", img: "https://images.unsplash.com/photo-1627037558426-c2d07beda3af?w=300&q=80", slug: "/reviews/rolex-submariner" },
  { id: "3", type: "Guide", title: "Best Dive Watches at Every Price Point", excerpt: "From Seiko to Rolex — the best dive watches you can buy in 2026.", date: "Jan 28, 2026", readTime: "12 min", img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=300&q=80", slug: "/blog/best-dive-watches" },
  { id: "4", type: "Brand", title: "Rolex — Brand Overview", excerpt: "History, collections, pricing, and collecting advice.", date: "Updated Feb 2026", readTime: "10 min", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&q=80", slug: "/brands/rolex" },
  { id: "5", type: "Article", title: "Why the Submariner Changed Everything", excerpt: "How one dive watch reshaped the entire luxury watch industry.", date: "Dec 15, 2025", readTime: "11 min", img: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=300&q=80", slug: "/blog/submariner-history" },
];

const typeColor: Record<string, string> = { Article: "var(--charcoal)", Review: "#2D6A4F", Guide: "#7B2D8B", Brand: "var(--gold)" };

export default function SearchPage() {
  const [query, setQuery] = useState("Submariner");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      <section className="pt-14 min-h-screen bg-[var(--bg)]">
        {/* Search Header */}
        <div className="bg-[var(--bg-warm)] border-b border-[var(--border)]">
          <div className="max-w-[800px] mx-auto px-6 md:px-10 pt-10 pb-9">
            <div className="flex items-center gap-3.5 px-5 py-3.5 border-2 border-[var(--charcoal)] bg-[var(--bg)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles, reviews, brands..." className="flex-1 border-none outline-none bg-transparent text-[16px] text-[var(--text)]" />
            </div>
            <div className="mt-3.5 flex items-center justify-between">
              <span className="text-[13px] text-[var(--text-secondary)]">
                <strong className="text-[var(--charcoal)]">{RESULTS.length} results</strong> for &ldquo;{query}&rdquo;
              </span>
              <div className="flex gap-2">
                {["All", "Articles", "Reviews", "Brands"].map((f, i) => (
                  <button key={f} className="text-[11.5px] px-3.5 py-1 border-none cursor-pointer transition-all" style={{ background: i === 0 ? "var(--charcoal)" : "transparent", color: i === 0 ? "#fff" : "var(--text-light)" }}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-[800px] mx-auto px-6 md:px-10 py-6 pb-16">
          {RESULTS.map((r, idx) => (
            <Link
              key={r.id}
              href={r.slug}
              className="flex gap-5 py-6 no-underline"
              style={{ borderBottom: idx < RESULTS.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={() => setHoveredId(r.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="w-[120px] h-[90px] min-w-[120px] overflow-hidden bg-[var(--bg-off)]">
                <img src={r.img} alt="" className="w-full h-full object-cover transition-transform duration-500" style={{ transform: hoveredId === r.id ? "scale(1.06)" : "scale(1)" }} />
              </div>
              <div className="flex-1">
                <div className="mb-1.5">
                  <span className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-2 py-0.5 text-white" style={{ background: typeColor[r.type] || "var(--text-secondary)" }}>{r.type}</span>
                </div>
                <h3 className="text-[19px] font-medium leading-tight mb-1.5 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredId === r.id ? "var(--gold-dark)" : "var(--charcoal)" }}>{r.title}</h3>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-snug mb-2 line-clamp-2">{r.excerpt}</p>
                <div className="text-[11.5px] text-[var(--text-light)]">{r.date} · ⏱ {r.readTime}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
