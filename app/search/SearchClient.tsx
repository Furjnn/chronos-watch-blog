"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Result {
  id: string; type: string; title: string; excerpt: string;
  date: string; readTime: string; img: string; slug: string;
}

const typeColor: Record<string, string> = { Article: "var(--charcoal)", Review: "#2D6A4F", Guide: "#7B2D8B", Brand: "var(--gold)" };

export default function SearchClient({ initialResults, initialQuery }: { initialResults: Result[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="pt-14 min-h-screen bg-[var(--bg)]">
      <div className="bg-[var(--bg-warm)] border-b border-[var(--border)]">
        <div className="max-w-[800px] mx-auto px-6 md:px-10 pt-10 pb-9">
          <form onSubmit={handleSearch} className="flex items-center gap-3.5 px-5 py-3.5 border-2 border-[var(--charcoal)] bg-[var(--bg)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles, reviews, brands..."
              className="flex-1 border-none outline-none bg-transparent text-[16px] text-[var(--text)]" />
            <button type="submit" className="text-[11px] font-bold tracking-[1.5px] uppercase px-4 py-2 bg-[var(--charcoal)] text-white border-none cursor-pointer">Search</button>
          </form>
          {initialQuery && (
            <div className="mt-3.5">
              <span className="text-[13px] text-[var(--text-secondary)]">
                <strong className="text-[var(--charcoal)]">{initialResults.length} results</strong> for &ldquo;{initialQuery}&rdquo;
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 md:px-10 py-6 pb-16">
        {!initialQuery ? (
          <p className="text-center text-[var(--text-light)] py-20">Enter a search query to find articles, reviews, and brands.</p>
        ) : initialResults.length === 0 ? (
          <p className="text-center text-[var(--text-light)] py-20">No results found for &ldquo;{initialQuery}&rdquo;. Try a different search term.</p>
        ) : (
          initialResults.map((r, idx) => (
            <Link key={r.id} href={r.slug} className="flex gap-5 py-6 no-underline"
              style={{ borderBottom: idx < initialResults.length - 1 ? "1px solid var(--border)" : "none" }}
              onMouseEnter={() => setHoveredId(r.id)} onMouseLeave={() => setHoveredId(null)}>
              <div className="relative w-[120px] h-[90px] min-w-[120px] overflow-hidden bg-[var(--bg-off)]">
                <Image src={r.img} alt={r.title} fill sizes="120px" className="object-cover transition-transform duration-500" style={{ transform: hoveredId === r.id ? "scale(1.06)" : "scale(1)" }} />
              </div>
              <div className="flex-1">
                <div className="mb-1.5">
                  <span className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-2 py-0.5 text-white" style={{ background: typeColor[r.type] || "var(--text-secondary)" }}>{r.type}</span>
                </div>
                <h3 className="text-[19px] font-medium leading-tight mb-1.5 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredId === r.id ? "var(--gold-dark)" : "var(--charcoal)" }}>{r.title}</h3>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-snug mb-2 line-clamp-2">{r.excerpt}</p>
                <div className="text-[11.5px] text-[var(--text-light)]">
                  {r.date}{r.readTime && ` · ⏱ ${r.readTime}`}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
