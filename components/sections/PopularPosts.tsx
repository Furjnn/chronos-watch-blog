"use client";

import { useState } from "react";
import Link from "next/link";

interface PopularPost {
  id: string;
  rank: number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  views: string;
  image: string;
  slug: string;
}

export function PopularPosts({ posts }: { posts: PopularPost[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="py-16 md:py-[72px] bg-[var(--bg-warm)]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Section Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-[var(--gold)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </span>
          <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)]">Trending Now</span>
        </div>
        <h2 className="text-[34px] font-medium text-[var(--charcoal)] leading-tight mb-1.5" style={{ fontFamily: "var(--font-display)" }}>Most Popular This Week</h2>
        <div className="w-10 h-0.5 bg-[var(--gold)] mb-9" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
          {/* Big Card */}
          <Link
            href={`/blog/${featured.slug}`}
            className="relative overflow-hidden bg-[var(--navy)] min-h-[300px] lg:min-h-[460px] no-underline block"
            onMouseEnter={() => setHoveredId(featured.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <img
              src={featured.image}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover opacity-75 transition-transform duration-700"
              style={{ transform: hoveredId === featured.id ? "scale(1.04)" : "scale(1)" }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
            <div className="absolute top-5 left-5 text-[64px] font-light text-[rgba(184,149,106,0.15)]" style={{ fontFamily: "var(--font-display)" }}>#1</div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[var(--gold)] bg-[rgba(184,149,106,0.12)] px-2.5 py-1">{featured.category}</span>
              <h3 className="text-white text-xl md:text-2xl font-medium leading-tight mt-3.5 mb-2.5" style={{ fontFamily: "var(--font-display)" }}>{featured.title}</h3>
              <div className="flex items-center gap-3.5 text-[12px] text-white/50">
                <span>{featured.date}</span>
                <span className="flex items-center gap-1">⏱ {featured.readTime}</span>
                <span className="flex items-center gap-1">👁 {featured.views} views</span>
              </div>
            </div>
          </Link>

          {/* Side Stack */}
          <div className="flex flex-col gap-0">
            {rest.map((post, idx) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex gap-4 py-4 px-4 items-center no-underline transition-colors"
                style={{
                  background: hoveredId === post.id ? "var(--bg)" : "transparent",
                  borderBottom: idx < rest.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                  flex: 1,
                }}
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="text-[28px] font-normal min-w-[28px] text-center transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredId === post.id ? "var(--gold)" : "rgba(184,149,106,0.3)" }}>
                  #{post.rank}
                </div>
                <div className="w-[72px] h-[72px] min-w-[72px] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500" style={{ transform: hoveredId === post.id ? "scale(1.1)" : "scale(1)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9.5px] font-bold tracking-[1.5px] uppercase text-[var(--gold)]">{post.category}</span>
                  <h4 className="text-[16px] font-medium text-[var(--charcoal)] leading-tight mt-1 mb-1 line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>{post.title}</h4>
                  <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-light)]">
                    <span>👁 {post.views}</span>
                    <span>⏱ {post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
