"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data — sonra Sanity'den gelecek
const CATEGORIES = ["All", "Review", "Guide", "Heritage", "Technical", "Vintage", "Interview", "Culture"];

const ALL_POSTS = [
  { id: "1", cat: "Review", title: "The New Submariner: A Deep Dive", excerpt: "An in-depth look at the latest iteration of the iconic diving watch that has defined a category for decades.", author: "James Chen", avatar: "JC", date: "Feb 14, 2026", readTime: "8 min", img: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&q=80", slug: "new-submariner" },
  { id: "2", cat: "Guide", title: "Investment Pieces: What to Buy in 2026", excerpt: "Expert insights on which timepieces are likely to appreciate in value and why they matter to collectors.", author: "Sofia Laurent", avatar: "SL", date: "Feb 12, 2026", readTime: "12 min", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80", slug: "investment-pieces" },
  { id: "3", cat: "Heritage", title: "Swiss Craftsmanship Through the Ages", excerpt: "Exploring the centuries-old traditions that make Swiss watchmaking the gold standard of haute horlogerie.", author: "Emilia Hartwell", avatar: "EH", date: "Feb 10, 2026", readTime: "10 min", img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80", slug: "swiss-craftsmanship" },
  { id: "4", cat: "Technical", title: "Understanding Complications", excerpt: "A comprehensive guide to the complex mechanisms that elevate a watch from good to truly exceptional.", author: "Luca Moretti", avatar: "LM", date: "Feb 8, 2026", readTime: "15 min", img: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80", slug: "understanding-complications" },
  { id: "5", cat: "Vintage", title: "The Golden Age of Horology", excerpt: "Discovering the timeless appeal of mid-century timepieces and why collectors can't get enough of them.", author: "James Chen", avatar: "JC", date: "Feb 6, 2026", readTime: "9 min", img: "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=600&q=80", slug: "golden-age" },
  { id: "6", cat: "Interview", title: "Master Watchmaker's Perspective", excerpt: "An exclusive conversation with one of the industry's most respected craftsmen about the future of horology.", author: "Sofia Laurent", avatar: "SL", date: "Feb 4, 2026", readTime: "11 min", img: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?w=600&q=80", slug: "watchmaker-perspective" },
  { id: "7", cat: "Review", title: "Tudor Black Bay 58: The Value Champion", excerpt: "At under $4,000, Tudor's flagship diver delivers a compelling package that rivals watches twice its price.", author: "Luca Moretti", avatar: "LM", date: "Feb 2, 2026", readTime: "10 min", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", slug: "tudor-black-bay" },
  { id: "8", cat: "Culture", title: "Watches and Cinema: A Love Story", excerpt: "From James Bond's Seamaster to Tony Stark's Richard Mille — how watches define characters on screen.", author: "Emilia Hartwell", avatar: "EH", date: "Jan 30, 2026", readTime: "7 min", img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80", slug: "watches-cinema" },
];

const POPULAR_SIDEBAR = [
  { id: "1", title: "Why the Rolex Daytona Remains King", views: "32.1K", readTime: "14 min" },
  { id: "2", title: "Best Dress Watches Under $2,000", views: "28.4K", readTime: "9 min" },
  { id: "3", title: "Grand Seiko: The Collector's Secret", views: "21.7K", readTime: "12 min" },
  { id: "4", title: "Omega vs Rolex: The Real Comparison", views: "19.3K", readTime: "18 min" },
  { id: "5", title: "Caring for Your Mechanical Watch", views: "15.8K", readTime: "6 min" },
];

const TAGS = ["Chronograph", "Dive Watch", "Dress Watch", "Tourbillon", "GMT", "Moonphase", "Automatic", "Manual Wind", "Pilot Watch", "Field Watch", "Micro-brand", "Limited Edition"];

const catColor: Record<string, string> = {
  Review: "#2D6A4F", Guide: "#7B2D8B", Heritage: "#B8956A", Technical: "#2563EB",
  Vintage: "#9A3412", Interview: "#0F766E", Culture: "#B91C1C",
};

export default function BlogIndex() {
  const [activeCat, setActiveCat] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredPopular, setHoveredPopular] = useState<string | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const PER_PAGE = 6;
  const filtered = activeCat === "All" ? ALL_POSTS : ALL_POSTS.filter((p) => p.cat === activeCat);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const posts = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div>
      {/* Page Header */}
      <section className="pt-14 bg-[var(--bg-warm)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-14 pb-10">
          <div className="text-[12px] text-[var(--text-light)] mb-5">
            <Link href="/" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Home</Link>
            <span className="mx-2 text-[var(--border)]">/</span>
            <span className="text-[var(--text)]">Blog</span>
          </div>
          <h1 className="text-[42px] font-normal text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>The Journal</h1>
          <p className="text-[15px] text-[var(--text-secondary)] max-w-[520px]">In-depth reviews, stories, and insights from the world of horology</p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mt-5" />
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex gap-0 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCat(cat); setCurrentPage(1); }}
              className="text-[12px] font-medium tracking-[0.5px] py-4 px-5 border-none cursor-pointer transition-all whitespace-nowrap bg-transparent"
              style={{
                color: activeCat === cat ? "var(--charcoal)" : "var(--text-light)",
                borderBottom: activeCat === cat ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 bg-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">

          {/* Post Grid */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="no-underline transition-transform duration-300"
                  style={{ transform: hoveredId === post.id ? "translateY(-3px)" : "none" }}
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: "4/3" }}>
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-600" style={{ transform: hoveredId === post.id ? "scale(1.04)" : "scale(1)" }} />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-2.5 py-1 text-white" style={{ background: catColor[post.cat] || "#777" }}>{post.cat}</span>
                    </div>
                  </div>
                  <h3 className="text-[19px] font-medium leading-tight mb-2 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredId === post.id ? "var(--gold-dark)" : "var(--charcoal)" }}>{post.title}</h3>
                  <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <div className="w-[26px] h-[26px] rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[11px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{post.avatar}</div>
                    <span className="text-[var(--text-secondary)]">{post.author}</span>
                    <span className="text-[var(--border)]">·</span>
                    <span className="text-[var(--text-light)]">{post.date}</span>
                    <span className="text-[var(--border)]">·</span>
                    <span className="text-[var(--text-light)]">⏱ {post.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-12">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center border border-[var(--border)] bg-[var(--bg)] cursor-pointer disabled:opacity-30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} className="w-9 h-9 flex items-center justify-center text-[13px] font-medium cursor-pointer transition-all" style={{ border: p === currentPage ? "1px solid var(--charcoal)" : "1px solid var(--border)", background: p === currentPage ? "var(--charcoal)" : "var(--bg)", color: p === currentPage ? "#fff" : "var(--text-secondary)" }}>{p}</button>
                ))}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center border border-[var(--border)] bg-[var(--bg)] cursor-pointer disabled:opacity-30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {/* Search */}
            <div className="bg-[var(--bg-off)] p-5 border border-[var(--border)]">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 border border-[var(--border)] bg-[var(--bg)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input placeholder="Search articles..." className="flex-1 border-none outline-none bg-transparent text-[13.5px] text-[var(--text)]" />
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-[var(--bg-off)] p-6 border border-[var(--border)]">
              <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Popular</div>
              <h3 className="text-[22px] font-medium text-[var(--charcoal)] mb-4" style={{ fontFamily: "var(--font-display)" }}>Most Read</h3>
              {POPULAR_SIDEBAR.map((post, idx) => (
                <div
                  key={post.id}
                  className="flex gap-3.5 py-3.5 cursor-pointer items-start"
                  style={{ borderBottom: idx < POPULAR_SIDEBAR.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                  onMouseEnter={() => setHoveredPopular(post.id)}
                  onMouseLeave={() => setHoveredPopular(null)}
                >
                  <span className="text-[24px] font-normal min-w-[24px] leading-none transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredPopular === post.id ? "var(--gold)" : "rgba(184,149,106,0.3)" }}>{idx + 1}</span>
                  <div>
                    <h4 className="text-[15px] font-medium leading-tight mb-1 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredPopular === post.id ? "var(--gold-dark)" : "var(--charcoal)" }}>{post.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-light)]">
                      <span>👁 {post.views}</span>
                      <span>⏱ {post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter Mini */}
            <div className="bg-[var(--charcoal)] p-7 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(184,149,106,1) 20px,rgba(184,149,106,1) 21px)" }} />
              <div className="relative">
                <div className="text-[10px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-2">Newsletter</div>
                <h3 className="text-[22px] font-normal text-white mb-2.5 leading-tight" style={{ fontFamily: "var(--font-display)" }}>Stories Worth Your Time</h3>
                <p className="text-[12.5px] text-white/45 leading-relaxed mb-4">Weekly curation delivered every Thursday.</p>
                <input placeholder="your@email.com" className="w-full px-3.5 py-2.5 border border-white/10 bg-white/[0.04] text-white text-[13px] outline-none mb-2.5" />
                <button className="w-full py-2.5 bg-[var(--gold)] border-none text-white text-[11px] font-bold tracking-[2px] uppercase cursor-pointer hover:bg-[var(--gold-light)] transition-colors">Subscribe</button>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[var(--bg-off)] p-6 border border-[var(--border)]">
              <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Browse</div>
              <h3 className="text-[22px] font-medium text-[var(--charcoal)] mb-4" style={{ fontFamily: "var(--font-display)" }}>Tags</h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11.5px] px-3.5 py-1.5 cursor-pointer transition-all"
                    style={{
                      border: hoveredTag === tag ? "1px solid var(--gold)" : "1px solid var(--border)",
                      background: hoveredTag === tag ? "var(--gold)" : "var(--bg)",
                      color: hoveredTag === tag ? "#fff" : "var(--text-secondary)",
                    }}
                    onMouseEnter={() => setHoveredTag(tag)}
                    onMouseLeave={() => setHoveredTag(null)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
