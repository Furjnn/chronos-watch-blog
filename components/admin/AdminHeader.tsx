"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AdminHeader({ userName }: { userName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchQueryFromUrl = pathname.startsWith("/admin/search") ? (searchParams.get("q") || "") : "";
  const formKey = pathname.startsWith("/admin/search")
    ? `admin-search-${searchQueryFromUrl}`
    : `admin-${pathname}`;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const goSearch = () => {
    const nextQuery = inputRef.current?.value.trim() || "";
    if (!nextQuery) {
      router.push("/admin/search");
      return;
    }

    router.push(`/admin/search?q=${encodeURIComponent(nextQuery)}`);
  };

  return (
    <header className="h-[60px] min-h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <form
          key={formKey}
          onSubmit={(event) => {
            event.preventDefault();
            goSearch();
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg flex-1"
        >
          <button
            type="submit"
            className="p-0 m-0 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <input
            ref={inputRef}
            defaultValue={searchQueryFromUrl}
            placeholder="Search content..."
            className="border-none outline-none bg-transparent text-[13px] text-slate-700 flex-1 placeholder:text-slate-400"
          />
          <kbd className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">Ctrl+K</kbd>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/posts/new")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B8956A] text-white rounded-lg text-[12px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Post
        </button>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-[12px] font-bold text-white">
            {userName[0]?.toUpperCase()}
          </div>
          <button onClick={handleLogout} className="text-[12px] text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
