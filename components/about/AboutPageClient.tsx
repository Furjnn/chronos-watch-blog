"use client";

import { useState } from "react";
import type { AboutPageContent } from "@/lib/about-page";
import Image from "next/image";

export default function AboutPageClient({ about }: { about: AboutPageContent }) {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  return (
    <div>
      <section className="pt-14 bg-[var(--navy)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(184,149,106,1) 40px,rgba(184,149,106,1) 41px)" }} />
        <div className="relative max-w-[800px] mx-auto px-6 md:px-10 py-20 text-center">
          <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-4">{about.heroBadge}</div>
          <h1 className="text-[52px] font-normal text-white leading-[1.1] mb-5" style={{ fontFamily: "var(--font-display)" }}>{about.heroTitle}</h1>
          <p className="text-[16px] text-white/55 leading-relaxed max-w-[580px] mx-auto">{about.heroSubtitle}</p>
          <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-7" />
        </div>
      </section>

      <section className="bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4">
          {about.stats.map((stat, i) => (
            <div key={`${stat.label}-${i}`} className="text-center py-9 px-5" style={{ borderRight: i < about.stats.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="text-[36px] font-normal text-[var(--gold)] mb-1" style={{ fontFamily: "var(--font-display)" }}>{stat.num}</div>
              <div className="text-[12px] text-[var(--text-light)] tracking-[0.5px]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-[72px] bg-[var(--bg)]">
        <div className="max-w-[720px] mx-auto px-6 md:px-10">
          <h2 className="text-[34px] font-medium text-[var(--charcoal)] mb-6 text-center" style={{ fontFamily: "var(--font-display)" }}>{about.missionHeading}</h2>
          <p className="text-[16px] text-[var(--text)] leading-[1.85] mb-5">{about.missionParagraphOne}</p>
          <blockquote className="my-8 py-5 pl-6 border-l-[3px] border-[var(--gold)] text-[24px] font-normal italic text-[var(--charcoal)] leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            &ldquo;{about.missionQuote}&rdquo;
          </blockquote>
          <p className="text-[16px] text-[var(--text)] leading-[1.85]">{about.missionParagraphTwo}</p>
        </div>
      </section>

      <section className="py-16 md:py-[72px] bg-[var(--bg-warm)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <div className="text-[11px] font-semibold tracking-[3px] uppercase text-[var(--gold)] mb-2">{about.teamBadge}</div>
            <h2 className="text-[34px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>{about.teamHeading}</h2>
            <div className="w-10 h-0.5 bg-[var(--gold)] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {about.team.map((member) => (
              <div key={member.name} className="text-center cursor-pointer" onMouseEnter={() => setHoveredMember(member.name)} onMouseLeave={() => setHoveredMember(null)}>
                <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden mx-auto mb-4 transition-all" style={{ border: hoveredMember === member.name ? "3px solid var(--gold)" : "3px solid transparent" }}>
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    sizes="140px"
                    className="object-cover transition-transform duration-500"
                    style={{ transform: hoveredMember === member.name ? "scale(1.08)" : "scale(1)" }}
                  />
                </div>
                <h3 className="text-[20px] font-medium text-[var(--charcoal)] mb-1" style={{ fontFamily: "var(--font-display)" }}>{member.name}</h3>
                <div className="text-[12px] text-[var(--gold)] font-medium mb-2.5">{member.role}</div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-[72px] bg-[var(--bg)]">
        <div className="max-w-[640px] mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <h2 className="text-[34px] font-medium text-[var(--charcoal)] mb-2" style={{ fontFamily: "var(--font-display)" }}>{about.contactHeading}</h2>
            <p className="text-[14px] text-[var(--text-secondary)]">{about.contactSubtitle}</p>
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
            <button className="self-start px-8 py-3.5 bg-[var(--charcoal)] border-none text-white text-[12px] font-semibold tracking-[2px] uppercase cursor-pointer hover:bg-[var(--gold)] transition-colors">{about.contactButtonLabel}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
