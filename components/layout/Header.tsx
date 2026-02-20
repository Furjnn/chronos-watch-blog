"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/components/i18n/I18nProvider";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import {
  DEFAULT_HEADER_NAVIGATION,
  getNavigationLabel,
  type HeaderNavigationItem,
} from "@/lib/navigation";

type MemberUser = {
  id: string;
  name: string;
  email: string;
};

type HeaderProps = {
  navigation?: HeaderNavigationItem[];
  siteName?: string | null;
  logo?: string | null;
};

export function Header({ navigation, siteName, logo }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t, localizePath } = useI18n();
  const resolvedSiteName = siteName?.trim() || "Chronos";
  const logoUrl = logo?.trim() || "";
  const hasLogo = Boolean(logoUrl);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [member, setMember] = useState<MemberUser | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const res = await fetch("/api/member/session", { cache: "no-store" });
        if (!mounted) return;

        if (!res.ok) {
          setMember(null);
          return;
        }

        const data = await res.json();
        setMember(data.user || null);
      } catch {
        if (mounted) setMember(null);
      }
    };

    getSession();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const handleMemberLogout = async () => {
    await fetch("/api/member/logout", { method: "POST" });
    setMember(null);
    router.refresh();
  };

  const isHome = stripLocaleFromPathname(pathname || "/") === "/";
  const bg = scrolled || !isHome
    ? "bg-white/[0.98] border-b border-[var(--border)]"
    : "bg-[rgba(26,26,26,0.4)] border-b border-white/[0.08]";
  const textColor = scrolled || !isHome ? "text-[var(--text-secondary)]" : "text-white/75";
  const logoColor = scrolled || !isHome ? "text-[var(--charcoal)]" : "text-white";
  const subtleBorder = scrolled || !isHome ? "border-[var(--border)]" : "border-white/20";
  const actionText = scrolled || !isHome ? "text-[var(--charcoal)]" : "text-white";
  const navItems = (navigation || DEFAULT_HEADER_NAVIGATION)
    .filter((item) => item.enabled)
    .map((item) => ({
      ...item,
      label: getNavigationLabel(item, locale),
      resolvedHref: localizePath(item.href),
    }));

  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] backdrop-blur-xl transition-all duration-400 ${bg}`}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between h-14">
        <Link
          href={localizePath("/")}
          className={`no-underline transition-colors ${hasLogo ? "flex items-center h-9" : `font-[var(--font-display)] text-[22px] font-semibold tracking-[2px] ${logoColor}`}`}
          style={hasLogo ? undefined : { fontFamily: "var(--font-display)" }}
        >
          {hasLogo ? (
            <img
              src={logoUrl}
              alt={resolvedSiteName}
              className="h-8 w-auto max-w-[180px] object-contain"
            />
          ) : (
            resolvedSiteName
          )}
        </Link>

        <nav className="hidden md:flex gap-8">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.id}
                href={item.resolvedHref}
                target="_blank"
                rel="noreferrer"
                className={`text-[12.5px] font-medium tracking-[0.8px] uppercase no-underline transition-colors hover:text-[var(--gold)] ${textColor}`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.resolvedHref}
                className={`text-[12.5px] font-medium tracking-[0.8px] uppercase no-underline transition-colors hover:text-[var(--gold)] ${textColor}`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {member ? (
              <>
                <Link
                  href={localizePath("/submit")}
                  className="px-3 py-1.5 rounded-md bg-[var(--gold)] text-[11px] uppercase tracking-[0.8px] font-semibold text-white no-underline transition-colors hover:brightness-95"
                >
                  {t("header.auth.newPost", "New Post")}
                </Link>
                <Link
                  href={localizePath("/account")}
                  className={`px-3 py-1.5 rounded-md border text-[11px] uppercase tracking-[0.8px] font-semibold no-underline transition-colors ${subtleBorder} ${actionText} hover:border-[var(--gold)] hover:text-[var(--gold)]`}
                >
                  {t("header.auth.account", "Account")}
                </Link>
                <button
                  onClick={handleMemberLogout}
                  className={`px-3 py-1.5 rounded-md border text-[11px] uppercase tracking-[0.8px] font-semibold bg-transparent cursor-pointer transition-colors ${subtleBorder} ${actionText} hover:border-[var(--gold)] hover:text-[var(--gold)]`}
                >
                  {t("header.auth.signOut", "Sign Out")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={localizePath("/account/login")}
                  className={`px-3 py-1.5 rounded-md border text-[11px] uppercase tracking-[0.8px] font-semibold no-underline transition-colors ${subtleBorder} ${actionText} hover:border-[var(--gold)] hover:text-[var(--gold)]`}
                >
                  {t("header.auth.signIn", "Sign In")}
                </Link>
                <Link
                  href={localizePath("/account/register")}
                  className="px-3 py-1.5 rounded-md bg-[var(--gold)] text-[11px] uppercase tracking-[0.8px] font-semibold text-white no-underline transition-colors hover:brightness-95"
                >
                  {t("header.auth.join", "Join")}
                </Link>
              </>
            )}
            <LanguageSwitcher compact />
          </div>

          <button onClick={() => router.push(localizePath("/search"))} className={`p-1 bg-transparent border-none cursor-pointer transition-colors hover:text-[var(--gold)] ${textColor}`} aria-label={t("search.button", "Search")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          <button
            className={`md:hidden p-1 bg-transparent border-none cursor-pointer ${textColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("common.menu", "Menu")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--border)] px-6 py-4">
          <div className="mb-3">
            <LanguageSwitcher compact />
          </div>
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.id}
                href={item.resolvedHref}
                target="_blank"
                rel="noreferrer"
                className="block py-3 text-sm font-medium text-[var(--text)] no-underline border-b border-[var(--border-light)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.resolvedHref}
                className="block py-3 text-sm font-medium text-[var(--text)] no-underline border-b border-[var(--border-light)]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}

          {member ? (
            <>
              <Link
                href={localizePath("/submit")}
                className="block py-3 text-sm font-medium text-[var(--text)] no-underline border-b border-[var(--border-light)]"
                onClick={() => setMobileOpen(false)}
              >
                {t("header.auth.newPost", "New Post")}
              </Link>
              <Link
                href={localizePath("/account")}
                className="block py-3 text-sm font-medium text-[var(--text)] no-underline border-b border-[var(--border-light)]"
                onClick={() => setMobileOpen(false)}
              >
                {t("header.auth.account", "Account")}
              </Link>
              <button
                onClick={async () => {
                  await handleMemberLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left py-3 text-sm font-medium text-[var(--text)] border-none bg-transparent cursor-pointer"
              >
                {t("header.auth.signOut", "Sign Out")}
              </button>
            </>
          ) : (
            <>
              <Link
                href={localizePath("/account/login")}
                className="block py-3 text-sm font-medium text-[var(--text)] no-underline border-b border-[var(--border-light)]"
                onClick={() => setMobileOpen(false)}
              >
                {t("header.auth.signIn", "Sign In")}
              </Link>
              <Link
                href={localizePath("/account/register")}
                className="block py-3 text-sm font-medium text-[var(--text)] no-underline"
                onClick={() => setMobileOpen(false)}
              >
                {t("header.auth.join", "Join")}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
