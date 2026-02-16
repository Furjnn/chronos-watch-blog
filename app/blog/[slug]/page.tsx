"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ARTICLE = {
  category: "Review",
  title: "The New Submariner: A Deep Dive Into Rolex's Most Iconic Timepiece",
  excerpt: "An in-depth look at the latest iteration of the iconic diving watch that has defined a category for over seven decades.",
  author: { name: "James Chen", role: "Senior Watch Editor", bio: "James has covered the watch industry for over 15 years, with a particular focus on dive watches and tool watches.", avatar: "JC" },
  date: "February 14, 2026",
  readTime: "8 min read",
  heroImg: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=1400&q=80",
  sections: [
    { id: "intro", label: "Introduction" },
    { id: "design", label: "Design & Case" },
    { id: "dial", label: "The Dial" },
    { id: "movement", label: "Movement" },
    { id: "bracelet", label: "Bracelet & Clasp" },
    { id: "verdict", label: "Final Verdict" },
  ],
};

const RELATED = [
  { id: "1", cat: "Review", title: "Tudor Black Bay 58: The Value Champion", date: "Feb 2, 2026", readTime: "10 min", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", slug: "tudor-black-bay" },
  { id: "2", cat: "Guide", title: "Best Dive Watches at Every Price Point", date: "Jan 28, 2026", readTime: "14 min", img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80", slug: "best-dive-watches" },
  { id: "3", cat: "Heritage", title: "The History of the Submariner", date: "Jan 20, 2026", readTime: "12 min", img: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&q=80", slug: "history-submariner" },
];

function ReadProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => { const h = document.documentElement.scrollHeight - window.innerHeight; setP(h > 0 ? (window.scrollY / h) * 100 : 0); };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <div className="fixed top-14 left-0 h-0.5 z-[999] bg-[var(--gold)]" style={{ width: `${p}%`, transition: "width 0.05s linear" }} />;
}

function TOCSidebar() {
  const [activeId, setActiveId] = useState("intro");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => {
      setVisible(window.scrollY > 600);
      for (const s of [...ARTICLE.sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 200) { setActiveId(s.id); break; }
      }
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="fixed right-[calc(50%-420px)] top-1/2 -translate-y-1/2 w-[180px] z-[100] hidden xl:block transition-opacity" style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}>
      <div className="text-[9.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-3.5">Contents</div>
      {ARTICLE.sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="block text-[12.5px] no-underline py-1.5 pl-3.5 transition-all" style={{ color: activeId === s.id ? "var(--charcoal)" : "var(--text-light)", fontWeight: activeId === s.id ? 600 : 400, borderLeft: activeId === s.id ? "2px solid var(--gold)" : "1px solid var(--border)" }}>{s.label}</a>
      ))}
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-8 right-8 w-[42px] h-[42px] z-[100] flex items-center justify-center bg-[var(--charcoal)] border-none text-white cursor-pointer transition-opacity" style={{ opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  );
}

export default function BlogPost() {
  const [hoveredRelated, setHoveredRelated] = useState<string | null>(null);

  return (
    <div>
      <ReadProgress />
      <TOCSidebar />
      <BackToTop />

      {/* Hero */}
      <section className="pt-14">
        <div className="relative overflow-hidden" style={{ height: "60vh", minHeight: 400, maxHeight: 560 }}>
          <img src={ARTICLE.heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)" }} />
        </div>
      </section>

      {/* Article Header */}
      <section className="bg-[var(--bg)]">
        <div className="max-w-[720px] mx-auto px-6 -mt-20 relative z-10">
          <div className="bg-[var(--bg)] pt-10">
            <div className="text-[12px] text-[var(--text-light)] mb-5">
              <Link href="/" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Home</Link>
              <span className="mx-2 text-[var(--border)]">/</span>
              <Link href="/blog" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Blog</Link>
              <span className="mx-2 text-[var(--border)]">/</span>
              <span className="text-[var(--text)]">The New Submariner</span>
            </div>
            <span className="text-[10px] font-bold tracking-[1.5px] uppercase px-3 py-1 text-white bg-[#2D6A4F] inline-block mb-4">{ARTICLE.category}</span>
            <h1 className="text-[var(--charcoal)] leading-[1.15] mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4vw,46px)", fontWeight: 400 }}>{ARTICLE.title}</h1>
            <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed mb-6">{ARTICLE.excerpt}</p>

            <div className="flex items-center gap-3.5 pb-7 border-b border-[var(--border)]">
              <div className="w-11 h-11 rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[16px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{ARTICLE.author.avatar}</div>
              <div>
                <div className="text-[14px] font-semibold text-[var(--charcoal)]">{ARTICLE.author.name}</div>
                <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-light)] mt-0.5">
                  <span>{ARTICLE.date}</span><span className="text-[var(--border)]">·</span><span>⏱ {ARTICLE.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="max-w-[720px] mx-auto px-6 pt-10">
        <div id="intro">
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6"><span className="float-left text-[60px] font-medium leading-[0.8] mr-2.5 mt-1 text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>T</span>he Rolex Submariner needs no introduction. Since its debut in 1953, it has defined what a dive watch should be — and, perhaps more importantly, what a luxury sport watch could become. The latest reference brings evolutionary refinements that respect the model&apos;s heritage while quietly addressing every criticism levied at its predecessor.</p>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">In this comprehensive review, we&apos;ll examine every facet of the new Submariner, from its subtly redesigned case to the powerhouse calibre beating within.</p>
        </div>

        <div id="design">
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mt-12 mb-5 pt-5" style={{ fontFamily: "var(--font-display)" }}>Design & Case</h2>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">The case retains its familiar 41mm diameter, but Rolex has introduced a subtle tapering to the lugs that makes the watch wear noticeably better on smaller wrists. The brushed surfaces are executed with the precision you&apos;d expect, and the chamfered edges catch light beautifully.</p>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">Water resistance remains rated at 300 meters — more than adequate for any recreational diving. The crown guards have been slightly reshaped, giving the profile a cleaner, more modern silhouette.</p>
          <figure className="my-9 -mx-4 md:-mx-16 text-center">
            <img src="https://images.unsplash.com/photo-1627037558426-c2d07beda3af?w=1200&q=80" alt="" className="w-full object-cover" style={{ maxHeight: 440 }} />
            <figcaption className="text-[12px] text-[var(--text-light)] mt-2.5 italic">The refined case profile of the new Submariner</figcaption>
          </figure>
        </div>

        <div id="dial">
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mt-12 mb-5 pt-5" style={{ fontFamily: "var(--font-display)" }}>The Dial</h2>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">On the dial, the changes are measured but meaningful. The hour markers appear fractionally larger, improving legibility without disrupting the classic proportions.</p>
          <blockquote className="my-10 py-6 pl-7 border-l-[3px] border-[var(--gold)] text-[24px] font-normal italic text-[var(--charcoal)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            &ldquo;The Submariner doesn&apos;t chase trends — it sets them, then waits patiently for the world to catch up.&rdquo;
          </blockquote>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">The date window features a cyclops lens offering 2.5x magnification. The printed text is crisp and perfectly centered.</p>
        </div>

        <div id="movement">
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mt-12 mb-5 pt-5" style={{ fontFamily: "var(--font-display)" }}>Movement</h2>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">Powering the new Submariner is the calibre 3235, Rolex&apos;s latest-generation movement offering a 70-hour power reserve.</p>
          <div className="my-7 border border-[var(--border)] overflow-hidden">
            {[["Calibre", "3235"], ["Power Reserve", "70 hours"], ["Frequency", "28,800 vph (4 Hz)"], ["Accuracy", "-2/+2 sec/day"], ["Functions", "Hours, minutes, seconds, date"]].map(([label, val], i, arr) => (
              <div key={label} className="flex" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="flex-[0_0_200px] px-4 py-3 bg-[var(--bg-off)] text-[13px] font-semibold text-[var(--charcoal)]">{label}</div>
                <div className="flex-1 px-4 py-3 text-[13px] text-[var(--text-secondary)]">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="bracelet">
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mt-12 mb-5 pt-5" style={{ fontFamily: "var(--font-display)" }}>Bracelet & Clasp</h2>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">The Oyster bracelet benefits from Rolex&apos;s latest generation of manufacturing. The Glidelock clasp allows for micro-adjustments in 2mm increments — invaluable for comfort throughout the day.</p>
        </div>

        <div id="verdict">
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mt-12 mb-5 pt-5" style={{ fontFamily: "var(--font-display)" }}>Final Verdict</h2>
          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">The new Submariner is an exercise in restraint — incremental improvements that collectively elevate an already exceptional timepiece.</p>

          {/* Rating Box */}
          <div className="my-8 p-8 bg-[var(--bg-warm)] border border-[rgba(184,149,106,0.2)]">
            <div className="flex items-center justify-between mb-5">
              <div className="text-[22px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>Our Rating</div>
              <div className="flex items-baseline gap-1">
                <span className="text-[42px] font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>9.2</span>
                <span className="text-[14px] text-[var(--text-light)]">/10</span>
              </div>
            </div>
            {[{ l: "Design", s: 95 }, { l: "Movement", s: 92 }, { l: "Value", s: 82 }, { l: "Comfort", s: 94 }, { l: "Finishing", s: 96 }].map((item) => (
              <div key={item.l} className="flex items-center gap-4 mb-2.5">
                <span className="text-[13px] text-[var(--text-secondary)] w-20">{item.l}</span>
                <div className="flex-1 h-1 bg-[var(--border)] rounded-sm overflow-hidden"><div className="h-full bg-[var(--gold)] rounded-sm" style={{ width: `${item.s}%` }} /></div>
                <span className="text-[12px] text-[var(--text-light)] w-8 text-right">{item.s}</span>
              </div>
            ))}
          </div>

          <p className="text-[16.5px] text-[var(--text)] leading-[1.85] mb-6">It&apos;s not just a dive watch — it&apos;s the dive watch.</p>
        </div>

        {/* Tags */}
        <div className="mt-12 pt-7 border-t border-[var(--border)] flex items-center gap-2 flex-wrap mb-6">
          <span className="text-[12px] text-[var(--text-light)] mr-1">Tags:</span>
          {["Rolex", "Submariner", "Dive Watch", "Review", "Luxury"].map((tag) => (
            <span key={tag} className="text-[11.5px] px-3 py-1 border border-[var(--border)] text-[var(--text-secondary)] cursor-pointer hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all">{tag}</span>
          ))}
        </div>

        {/* Author Bio */}
        <div className="mb-14 p-8 bg-[var(--bg-off)] border border-[var(--border)] flex gap-6">
          <div className="w-[72px] h-[72px] min-w-[72px] rounded-full bg-[var(--bg-warm)] flex items-center justify-center text-[24px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{ARTICLE.author.avatar}</div>
          <div>
            <div className="text-[10px] font-semibold tracking-[2px] uppercase text-[var(--gold)] mb-1">Written by</div>
            <div className="text-[22px] font-medium text-[var(--charcoal)] mb-0.5" style={{ fontFamily: "var(--font-display)" }}>{ARTICLE.author.name}</div>
            <div className="text-[12.5px] text-[var(--text-light)] mb-2.5">{ARTICLE.author.role}</div>
            <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{ARTICLE.author.bio}</p>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-14 bg-[var(--bg-warm)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Keep Reading</div>
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Related Articles</h2>
          <div className="w-10 h-0.5 bg-[var(--gold)] mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {RELATED.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="no-underline transition-transform duration-300" style={{ transform: hoveredRelated === post.id ? "translateY(-3px)" : "none" }} onMouseEnter={() => setHoveredRelated(post.id)} onMouseLeave={() => setHoveredRelated(null)}>
                <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: "16/10" }}>
                  <img src={post.img} alt="" className="w-full h-full object-cover transition-transform duration-600" style={{ transform: hoveredRelated === post.id ? "scale(1.04)" : "scale(1)" }} />
                </div>
                <h3 className="text-[19px] font-medium leading-tight mb-2 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredRelated === post.id ? "var(--gold-dark)" : "var(--charcoal)" }}>{post.title}</h3>
                <div className="text-[12px] text-[var(--text-light)]">{post.date} · ⏱ {post.readTime}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
