"use client";

import { useState, useEffect } from "react";

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 w-[42px] h-[42px] z-[100] flex items-center justify-center bg-[var(--charcoal)] border-none text-white cursor-pointer transition-opacity"
      style={{ opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  );
}

export default function BlogPostClient({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <BackToTop />
      {children}
    </div>
  );
}
