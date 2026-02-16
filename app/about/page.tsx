"use client";

import { useState } from "react";

const TEAM = [
  { name: "James Chen", role: "Senior Watch Editor", bio: "15 years covering the watch industry. Dive watch specialist.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
  { name: "Sofia Laurent", role: "Buying Guide Editor", bio: "Former luxury retail consultant. Investment watch expert.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80" },
  { name: "Emilia Hartwell", role: "Culture & Heritage Writer", bio: "Historian focused on cultural significance of watchmaking.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80" },
  { name: "Luca Moretti", role: "Technical Editor", bio: "Trained watchmaker turned writer. Movement specialist.", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80" },
];

const STATS = [
  { num: "500+", label: "Articles Published" },
  { num: "12.4K", label: "Newsletter Subscribers" },
  { num: "85+", label: "Brands Covered" },
  { num: "4", label: "Years Running" },
];

export default function AboutPage() {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="pt-14 bg-[var(--navy)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(184,149,106,1) 40px,rgba(184,149,106,1) 41px)" }} />
        <div className="relative max-w-[800px] mx-auto px-6 md:px-10 py-20 text-center">
          <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-4">Our Story</div>
          <h1 className="text-[52px] font-normal text-white leading-[1.1] mb-5" style={{ fontFamily: "var(--font-display)" }}>About Chronos</h1>
          <p className="text-[16px] text-white/55 leading-relaxed max-w-[580px] mx-auto">We believe great watchmaking deserves great storytelling.</p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-7" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center py-9 px-5" style={{ borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
              <div className="text-[36px] font-normal text-[var(--gold)] mb-1" style={{ fontFamily: "var(--font-display)" }}>{s.num}</div>
              <div className="text-[12px] text-[var(--text-light)] tracking-[0.5px]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-[72px] bg-[var(--bg)]">
        <div className="max-w-[720px] mx-auto px-6 md:px-10">
          <h2 className="text-[34px] font-medium text-[var(--charcoal)] mb-6 text-center" style={{ fontFamily: "var(--font-display)" }}>Our Mission</h2>
          <p className="text-[16px] text-[var(--text)] leading-[1.85] mb-5">In a world of fleeting trends and disposable technology, mechanical watches represent something enduring — craftsmanship passed down through generations, engineering that transcends its era.</p>
          <blockquote className="my-8 py-5 pl-6 border-l-[3px] border-[var(--gold)] text-[24px] font-normal italic text-[var(--charcoal)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            &ldquo;Every watch has a story. Our job is to tell it beautifully.&rdquo;
          </blockquote>
          <p className="text-[16px] text-[var(--text)] leading-[1.85]">Whether you&apos;re buying your first automatic or adding a grail piece to your collection, we&apos;re here to guide, inform, and inspire.</p>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-[72px] bg-[var(--bg-warm)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-2">The People</div>
            <h2 className="text-[34px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>Editorial Team</h2>
            <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {TEAM.map((m) => (
              <div key={m.name} className="text-center cursor-pointer" onMouseEnter={() => setHoveredMember(m.name)} onMouseLeave={() => setHoveredMember(null)}>
                <div className="w-[140px] h-[140px] rounded-full overflow-hidden mx-auto mb-4 transition-all" style={{ border: hoveredMember === m.name ? "3px solid var(--gold)" : "3px solid transparent" }}>
                  <img src={m.img} alt="" className="w-full h-full object-cover transition-transform duration-500" style={{ transform: hoveredMember === m.name ? "scale(1.08)" : "scale(1)" }} />
                </div>
                <h3 className="text-[20px] font-medium text-[var(--charcoal)] mb-1" style={{ fontFamily: "var(--font-display)" }}>{m.name}</h3>
                <div className="text-[12px] text-[var(--gold)] font-medium mb-2.5">{m.role}</div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-[72px] bg-[var(--bg)]">
        <div className="max-w-[640px] mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <h2 className="text-[34px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>Get in Touch</h2>
            <p className="text-[14px] text-[var(--text-secondary)]">Have a question, story tip, or partnership inquiry?</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold tracking-[1px] uppercase text-[var(--text-secondary)] block mb-1.5">Name</label>
                <input placeholder="Your name" className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg)] text-[14px] text-[var(--text)] outline-none focus:border-[var(--gold)] transition-colors" />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-[1px] uppercase text-[var(--text-secondary)] block mb-1.5">Email</label>
                <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg)] text-[14px] text-[var(--text)] outline-none focus:border-[var(--gold)] transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-[1px] uppercase text-[var(--text-secondary)] block mb-1.5">Message</label>
              <textarea rows={5} placeholder="Your message..." className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--bg)] text-[14px] text-[var(--text)] outline-none resize-y focus:border-[var(--gold)] transition-colors" />
            </div>
            <button className="self-start px-8 py-3.5 bg-[var(--charcoal)] border-none text-white text-[12px] font-semibold tracking-[2px] uppercase cursor-pointer hover:bg-[var(--gold)] transition-colors">Send Message</button>
          </div>
        </div>
      </section>
    </div>
  );
}
