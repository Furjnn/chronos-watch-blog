"use client";

import { useState } from "react";
import Link from "next/link";

const GALLERY = [
  "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&q=80",
  "https://images.unsplash.com/photo-1627037558426-c2d07beda3af?w=800&q=80",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
  "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80",
];

const SPECS = [
  ["Reference", "126610LN"], ["Brand", "Rolex"], ["Collection", "Submariner"],
  ["Case Material", "Oystersteel (904L)"], ["Case Diameter", "41mm"], ["Case Thickness", "12.5mm"],
  ["Water Resistance", "300m / 1000ft"], ["Crystal", "Sapphire with Cyclops"],
  ["Movement", "Calibre 3235"], ["Power Reserve", "70 hours"], ["Frequency", "28,800 vph"],
  ["Bracelet", "Oyster, Oystersteel"], ["Clasp", "Oysterlock with Glidelock"],
];

const PROS = ["Exceptional build quality and finishing", "70-hour power reserve is class-leading", "Glidelock clasp for easy micro-adjustments", "Excellent lume performance", "Holds value remarkably well"];
const CONS = ["Difficult to acquire at retail price", "Date cyclops remains polarizing", "Incremental design changes may disappoint some"];

const SIMILAR = [
  { id: "1", title: "Tudor Black Bay 58", brand: "Tudor", rating: 8.8, price: "$3,975", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80", slug: "tudor-bb58" },
  { id: "2", title: "Omega Seamaster 300M", brand: "Omega", rating: 9.0, price: "$5,300", img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80", slug: "omega-seamaster" },
  { id: "3", title: "Blancpain Fifty Fathoms", brand: "Blancpain", rating: 9.1, price: "$11,100", img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80", slug: "blancpain-ff" },
];

export default function ReviewDetail() {
  const [selectedImg, setSelectedImg] = useState(0);
  const [hoveredSimilar, setHoveredSimilar] = useState<string | null>(null);

  return (
    <div>
      <section className="pt-14 bg-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-8">
          <div className="text-[12px] text-[var(--text-light)] mb-6">
            <Link href="/" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Home</Link>
            <span className="mx-2 text-[var(--border)]">/</span>
            <Link href="/reviews" className="text-[var(--text-light)] no-underline hover:text-[var(--gold)]">Reviews</Link>
            <span className="mx-2 text-[var(--border)]">/</span>
            <span className="text-[var(--text)]">Rolex Submariner 126610LN</span>
          </div>

          {/* Top: Gallery + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-[var(--border)]">
            {/* Gallery */}
            <div>
              <div className="overflow-hidden mb-3 bg-[var(--bg-off)]" style={{ aspectRatio: "1" }}>
                <img src={GALLERY[selectedImg]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                {GALLERY.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} className="flex-1 p-0 border-2 cursor-pointer overflow-hidden bg-[var(--bg-off)]" style={{ aspectRatio: "1", borderColor: i === selectedImg ? "var(--gold)" : "transparent", opacity: i === selectedImg ? 1 : 0.6 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="text-[12px] font-medium text-[var(--gold)] tracking-[1.5px] uppercase mb-1.5">Rolex</div>
              <h1 className="text-[36px] font-normal text-[var(--charcoal)] leading-[1.15] mb-1.5" style={{ fontFamily: "var(--font-display)" }}>Submariner Date 126610LN</h1>
              <p className="text-[14px] text-[var(--text-secondary)] mb-5">The definitive dive watch, refined for a new generation</p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--border)]">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg key={n} width="18" height="18" viewBox="0 0 24 24" fill={n <= 4 ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  ))}
                </div>
                <span className="text-[28px] font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>9.2</span>
                <span className="text-[13px] text-[var(--text-light)]">/10</span>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[{ l: "Case Size", v: "41mm" }, { l: "Movement", v: "Cal. 3235" }, { l: "Water Resist.", v: "300m" }, { l: "Power Reserve", v: "70 hours" }].map((s) => (
                  <div key={s.l} className="p-3.5 bg-[var(--bg-off)] border border-[var(--border)]">
                    <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[var(--text-light)] mb-1">{s.l}</div>
                    <div className="text-[18px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[var(--text-light)] mb-1">Price Range</div>
                <div className="text-[28px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>$10,250 — $14,800</div>
                <div className="text-[12px] text-[var(--text-light)] mt-0.5">Retail to pre-owned market</div>
              </div>

              {/* CTA */}
              <button className="w-full py-3.5 bg-[var(--gold)] border-none text-white text-[12px] font-bold tracking-[2px] uppercase cursor-pointer hover:bg-[var(--gold-light)] transition-colors">Check Availability</button>
            </div>
          </div>
        </div>
      </section>

      {/* Verdict Banner */}
      <section className="bg-[var(--bg-warm)] py-9 border-b border-[rgba(184,149,106,0.15)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-[10px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Editor&apos;s Verdict</div>
          <p className="text-[20px] font-normal italic text-[var(--charcoal)] leading-snug max-w-[800px]" style={{ fontFamily: "var(--font-display)" }}>
            &ldquo;The Submariner remains the benchmark by which all dive watches are measured. A masterclass in evolutionary design.&rdquo;
          </p>
          <span className="text-[12px] text-[var(--text-light)] mt-2 block">— James Chen, Senior Watch Editor</span>
        </div>
      </section>

      {/* Pros / Cons */}
      <section className="py-12 bg-[var(--bg)]">
        <div className="max-w-[800px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-7 border border-[rgba(45,106,79,0.2)] bg-[rgba(45,106,79,0.02)]">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--green)] mb-4">Pros</div>
            {PROS.map((p) => (
              <div key={p} className="flex gap-2.5 items-start mb-3">
                <svg className="mt-0.5 min-w-[14px]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                <span className="text-[13.5px] text-[var(--text)] leading-snug">{p}</span>
              </div>
            ))}
          </div>
          <div className="p-7 border border-[rgba(185,28,28,0.15)] bg-[rgba(185,28,28,0.02)]">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--red)] mb-4">Cons</div>
            {CONS.map((c) => (
              <div key={c} className="flex gap-2.5 items-start mb-3">
                <svg className="mt-0.5 min-w-[14px]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                <span className="text-[13.5px] text-[var(--text)] leading-snug">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Specs */}
      <section className="py-12 bg-[var(--bg-off)]">
        <div className="max-w-[800px] mx-auto px-6 md:px-10">
          <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Technical</div>
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Full Specifications</h2>
          <div className="w-10 h-0.5 bg-[var(--gold)] mb-7" />
          <div className="border border-[var(--border)] overflow-hidden bg-[var(--bg)]">
            {SPECS.map(([label, val], i) => (
              <div key={label} className="flex" style={{ borderBottom: i < SPECS.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="flex-[0_0_200px] px-4 py-3 bg-[var(--bg-off)] text-[13px] font-semibold text-[var(--charcoal)]">{label}</div>
                <div className="flex-1 px-4 py-3 text-[13px] text-[var(--text-secondary)]">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Similar Watches */}
      <section className="py-14 bg-[var(--bg)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-[10.5px] font-semibold tracking-[2.5px] uppercase text-[var(--gold)] mb-1.5">Compare</div>
          <h2 className="text-[30px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Similar Watches</h2>
          <div className="w-10 h-0.5 bg-[var(--gold)] mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {SIMILAR.map((w) => (
              <Link key={w.id} href={`/reviews/${w.slug}`} className="no-underline transition-transform duration-300" style={{ transform: hoveredSimilar === w.id ? "translateY(-3px)" : "none" }} onMouseEnter={() => setHoveredSimilar(w.id)} onMouseLeave={() => setHoveredSimilar(null)}>
                <div className="overflow-hidden mb-3.5 bg-[var(--bg-off)]" style={{ aspectRatio: "4/3" }}>
                  <img src={w.img} alt="" className="w-full h-full object-cover transition-transform duration-600" style={{ transform: hoveredSimilar === w.id ? "scale(1.04)" : "scale(1)" }} />
                </div>
                <div className="text-[11px] font-medium text-[var(--gold)] tracking-[1px] uppercase mb-1">{w.brand}</div>
                <h3 className="text-[18px] font-medium leading-tight mb-2 transition-colors" style={{ fontFamily: "var(--font-display)", color: hoveredSimilar === w.id ? "var(--gold-dark)" : "var(--charcoal)" }}>{w.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[20px] font-light text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>{w.rating}</span>
                    <span className="text-[12px] text-[var(--text-light)]">/10</span>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--charcoal)]">{w.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
