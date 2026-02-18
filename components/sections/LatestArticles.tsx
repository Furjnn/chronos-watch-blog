"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  slug: string;
}

const catColor: Record<string, string> = {
  Review: "#2D6A4F", Guide: "#7B2D8B", Heritage: "#B8956A",
  Technical: "#2563EB", Vintage: "#9A3412", Interview: "#0F766E",
};

export function LatestArticles({ posts }: { posts: Article[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-16 md:py-[72px] bg-[var(--bg)]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <h2 className="text-[34px] font-medium text-[var(--charcoal)] mb-1.5" style={{ fontFamily: "var(--font-display)" }}>Latest Articles</h2>
        <p className="text-sm text-[var(--text-light)] mb-9">In-depth reviews, stories, and insights from the world of horology</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="no-underline transition-transform duration-300"
              style={{ transform: hoveredId === post.id ? "translateY(-4px)" : "none" }}
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative overflow-hidden mb-4" style={{ aspectRatio: "4/3" }}>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-600"
                  style={{ transform: hoveredId === post.id ? "scale(1.05)" : "scale(1)" }}
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-3 py-1 text-white" style={{ background: catColor[post.category] || "#777" }}>{post.category}</span>
                </div>
              </div>

              <h3 className="text-[20px] font-medium leading-tight mb-2 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredId === post.id ? "var(--gold-dark)" : "var(--charcoal)" }}>{post.title}</h3>

              <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mb-3.5 line-clamp-2">{post.excerpt}</p>

              <div className="flex items-center justify-between pt-3.5 border-t border-[rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[11px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{post.author[0]}</div>
                  <span className="text-[12px] text-[var(--text-secondary)]">{post.author}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-light)]">
                  <span>{post.date}</span>
                  <span>⏱ {post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/blog" className="inline-block px-11 py-3.5 text-[11.5px] font-semibold tracking-[2px] uppercase bg-transparent border border-[var(--charcoal)] text-[var(--charcoal)] no-underline hover:bg-[var(--charcoal)] hover:text-white transition-all">
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
