"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <section className="py-20 md:py-[88px] bg-[var(--charcoal)] relative overflow-hidden">
      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(184,149,106,1) 40px, rgba(184,149,106,1) 41px)" }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

      <div className="relative max-w-[560px] mx-auto px-6 md:px-10 text-center">
        <div className="text-[var(--gold)] flex justify-center mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        <h2 className="text-white leading-tight mb-3.5" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 400 }}>Stay Updated</h2>
        <p className="text-[14px] text-white/50 leading-relaxed mb-8">
          Subscribe to our newsletter for the latest watch reviews, industry news, and exclusive content
        </p>

        <div className="flex max-w-[440px] mx-auto transition-colors" style={{ border: `1px solid ${focused ? "var(--gold)" : "rgba(255,255,255,0.12)"}` }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 px-4 py-3.5 border-none outline-none bg-white/[0.04] text-white text-[13.5px]"
            style={{ fontFamily: "var(--font-body)" }}
          />
          <button className="px-6 py-3.5 bg-[var(--gold)] border-none text-white text-[11.5px] font-bold tracking-[2px] uppercase cursor-pointer hover:bg-[var(--gold-light)] transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
