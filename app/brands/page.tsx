"use client";

import { useState } from "react";
import Link from "next/link";

const SEGMENTS = ["All", "Entry", "Mid-Range", "Luxury", "Ultra-Luxury"];

const BRANDS = [
  { name: "Rolex", country: "Switzerland 🇨🇭", segment: "Luxury", founded: 1905, articles: 42, desc: "Crown jewel of Swiss watchmaking, defining the luxury sport watch category.", img: "https://images.unsplash.com/photo-1627037558426-c2d07beda3af?w=400&q=80", slug: "rolex" },
  { name: "Omega", country: "Switzerland 🇨🇭", segment: "Luxury", founded: 1848, articles: 38, desc: "From the Moon to the deepest oceans — Omega defines horological achievement.", img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80", slug: "omega" },
  { name: "Patek Philippe", country: "Switzerland 🇨🇭", segment: "Ultra-Luxury", founded: 1839, articles: 28, desc: "The last truly independent Geneva manufacture.", img: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400&q=80", slug: "patek-philippe" },
  { name: "Cartier", country: "France 🇫🇷", segment: "Luxury", founded: 1847, articles: 22, desc: "Where jewelry meets watchmaking — timeless designs.", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80", slug: "cartier" },
  { name: "Audemars Piguet", country: "Switzerland 🇨🇭", segment: "Ultra-Luxury", founded: 1875, articles: 31, desc: "Pioneers of the luxury sport watch with the iconic Royal Oak.", img: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=400&q=80", slug: "audemars-piguet" },
  { name: "Tudor", country: "Switzerland 🇨🇭", segment: "Mid-Range", founded: 1926, articles: 24, desc: "Rolex's sister brand offering exceptional value.", img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&q=80", slug: "tudor" },
  { name: "Grand Seiko", country: "Japan 🇯🇵", segment: "Luxury", founded: 1960, articles: 19, desc: "Japanese perfection — precision meets artistic finishing.", img: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=400&q=80", slug: "grand-seiko" },
  { name: "IWC", country: "Switzerland 🇨🇭", segment: "Luxury", founded: 1868, articles: 21, desc: "Engineering-driven watchmaking with iconic collections.", img: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&q=80", slug: "iwc" },
  { name: "Seiko", country: "Japan 🇯🇵", segment: "Entry", founded: 1881, articles: 15, desc: "From affordable automatics to Spring Drive — covers every price point.", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80", slug: "seiko" },
];

const segColor: Record<string, string> = { Entry: "#2563EB", "Mid-Range": "#0F766E", Luxury: "#B8956A", "Ultra-Luxury": "#7B2D8B" };

export default function BrandsPage() {
  const [seg, setSeg] = useState("All");
  const [hovered, setHovered] = useState<string | null>(null);
  const filtered = seg === "All" ? BRANDS : BRANDS.filter((b) => b.segment === seg);

  return (
    <div>
      <section className="pt-14 bg-[var(--navy)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 text-center">
          <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-3">Directory</div>
          <h1 className="text-[48px] font-normal text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Watch Brands</h1>
          <p className="text-[15px] text-white/50 max-w-[500px] mx-auto">Explore the world&apos;s finest watchmakers</p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-6" />
        </div>
      </section>

      {/* Filters */}
      <section className="bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex justify-center gap-0">
          {SEGMENTS.map((s) => (
            <button key={s} onClick={() => setSeg(s)} className="text-[12px] font-medium tracking-[0.5px] py-4 px-6 border-none cursor-pointer transition-all bg-transparent" style={{ color: seg === s ? "var(--charcoal)" : "var(--text-light)", borderBottom: seg === s ? "2px solid var(--gold)" : "2px solid transparent" }}>{s}</button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-[var(--bg-off)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((brand) => (
              <Link
                key={brand.name}
                href={`/brands/${brand.slug}`}
                className="bg-[var(--bg)] border border-[var(--border)] overflow-hidden no-underline transition-all duration-300"
                style={{ transform: hovered === brand.name ? "translateY(-4px)" : "none", boxShadow: hovered === brand.name ? "0 12px 32px rgba(0,0,0,0.06)" : "none" }}
                onMouseEnter={() => setHovered(brand.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="h-[180px] overflow-hidden relative">
                  <img src={brand.img} alt="" className="w-full h-full object-cover transition-transform duration-600" style={{ transform: hovered === brand.name ? "scale(1.05)" : "scale(1)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                  <div className="absolute bottom-3.5 left-4">
                    <span className="text-[9.5px] font-bold tracking-[1.2px] uppercase px-2.5 py-1 text-white" style={{ background: segColor[brand.segment] }}>{brand.segment}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[24px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{brand.name}</h3>
                    <span className="text-[11px] text-[var(--text-light)]">Est. {brand.founded}</span>
                  </div>
                  <div className="text-[12px] text-[var(--text-light)] mb-2.5">{brand.country}</div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">{brand.desc}</p>
                  <div className="flex items-center justify-between pt-3.5 border-t border-[var(--border)]">
                    <span className="text-[12px] text-[var(--text-light)]">{brand.articles} articles</span>
                    <span className="text-[11px] font-semibold tracking-[1px] uppercase transition-colors" style={{ color: hovered === brand.name ? "var(--gold)" : "var(--text-secondary)" }}>Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
