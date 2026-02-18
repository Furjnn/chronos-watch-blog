"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { label: "Latest", href: "/blog" },
  { label: "Reviews", href: "/reviews" },
  { label: "Brands", href: "/brands" },
  { label: "Vintage", href: "/blog?category=vintage" },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isHome = pathname === "/";
  const bg = scrolled || !isHome
    ? "bg-white/[0.98] border-b border-[var(--border)]"
    : "bg-[rgba(26,26,26,0.4)] border-b border-white/[0.08]";
  const textColor = scrolled || !isHome ? "text-[var(--text-secondary)]" : "text-white/75";
  const logoColor = scrolled || !isHome ? "text-[var(--charcoal)]" : "text-white";

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] backdrop-blur-xl transition-all duration-400 ${bg}`}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/"
          className={`font-[var(--font-display)] text-[22px] font-semibold tracking-[2px] no-underline transition-colors ${logoColor}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          CHRONOS
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-[12.5px] font-medium tracking-[0.8px] uppercase no-underline transition-colors hover:text-[var(--gold)] ${textColor}`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search + Mobile Menu */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/search")} className={`p-1 bg-transparent border-none cursor-pointer transition-colors hover:text-[var(--gold)] ${textColor}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-1 bg-transparent border-none cursor-pointer ${textColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--border)] px-6 py-4">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block py-3 text-sm font-medium text-[var(--text)] no-underline border-b border-[var(--border-light)]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
