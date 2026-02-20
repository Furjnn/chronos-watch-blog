"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type HeaderNotificationSeverity = "info" | "success" | "warning" | "critical";

interface HeaderNotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  severity: HeaderNotificationSeverity;
  unread: boolean;
  createdAt: string;
}

interface AdminHeaderProps {
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  initialNotifications: HeaderNotificationItem[];
  initialUnreadNotificationCount: number;
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityDotClass(severity: HeaderNotificationSeverity) {
  if (severity === "critical") return "bg-rose-500";
  if (severity === "warning") return "bg-amber-500";
  if (severity === "success") return "bg-emerald-500";
  return "bg-slate-400";
}

export default function AdminHeader({
  userName,
  userEmail,
  userAvatar,
  initialNotifications,
  initialUnreadNotificationCount,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(initialUnreadNotificationCount);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const searchQueryFromUrl = pathname.startsWith("/admin/search") ? (searchParams.get("q") || "") : "";
  const formKey = pathname.startsWith("/admin/search")
    ? `admin-search-${searchQueryFromUrl}`
    : `admin-${pathname}`;
  const displayName = userName.trim() || "Admin";
  const avatarLetter = (displayName || userEmail || "?").trim().charAt(0).toUpperCase();
  const previewNotifications = useMemo(() => notifications.slice(0, 6), [notifications]);

  useEffect(() => {
    setNotifications(initialNotifications);
    setUnreadNotificationCount(initialUnreadNotificationCount);
  }, [initialNotifications, initialUnreadNotificationCount]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const refreshNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await fetch("/api/admin/notifications?limit=10", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (!data || !Array.isArray(data.items)) return;
      setNotifications(data.items as HeaderNotificationItem[]);
      setUnreadNotificationCount(Number(data.unreadCount) || 0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationsAsRead = async (ids: string[], markAll = false) => {
    if (ids.length === 0 && !markAll) return;
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(markAll ? { all: true } : { ids }),
      });
    } catch {
      // Silent by design: UI still updates optimistically.
    }

    if (markAll) {
      setUnreadNotificationCount(0);
      setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
      return;
    }

    const idSet = new Set(ids);
    const markedCount = notifications.reduce((count, item) => (
      item.unread && idSet.has(item.id) ? count + 1 : count
    ), 0);
    setNotifications((prev) => prev.map((item) => {
      if (!item.unread || !idSet.has(item.id)) return item;
      return { ...item, unread: false };
    }));
    setUnreadNotificationCount((prev) => Math.max(0, prev - markedCount));
  };

  const openNotification = async (item: HeaderNotificationItem) => {
    if (item.unread) {
      await markNotificationsAsRead([item.id]);
    }
    setIsNotificationMenuOpen(false);
    router.push(item.href || "/admin/notifications");
  };

  useEffect(() => {
    if (!isNotificationMenuOpen) return;
    void refreshNotifications();
  }, [isNotificationMenuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        setIsNotificationMenuOpen(false);
      }
    };

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (profileMenuRef.current && target && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationMenuRef.current && target && !notificationMenuRef.current.contains(target)) {
        setIsNotificationMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
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

      <div className="flex items-center gap-3">
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

        <div
          className="relative"
          ref={notificationMenuRef}
          onMouseEnter={() => setIsNotificationMenuOpen(true)}
          onMouseLeave={() => setIsNotificationMenuOpen(false)}
        >
          <button
            onClick={() => router.push("/admin/notifications")}
            className="relative p-2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadNotificationCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            ) : null}
          </button>

          {isNotificationMenuOpen ? (
            <div className="absolute right-0 top-full w-[360px] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <p className="text-[12px] font-semibold text-slate-700">Notifications</p>
                  <p className="text-[11px] text-slate-400">{unreadNotificationCount} unread</p>
                </div>
                <button
                  onClick={() => markNotificationsAsRead([], true)}
                  disabled={unreadNotificationCount === 0}
                  className="text-[11px] px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 cursor-pointer disabled:opacity-50"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                {loadingNotifications ? (
                  <div className="px-4 py-8 text-center text-[12px] text-slate-400">Loading...</div>
                ) : previewNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[12px] text-slate-400">No notifications yet.</div>
                ) : (
                  previewNotifications.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openNotification(item)}
                      className={`w-full text-left px-4 py-3 bg-transparent border-none cursor-pointer hover:bg-slate-50 transition-colors ${item.unread ? "bg-[#FFFDF8]" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1.5 w-2 h-2 rounded-full ${severityDotClass(item.severity)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-700 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatNotificationTime(item.createdAt)}</p>
                        </div>
                        {item.unread ? <span className="w-1.5 h-1.5 rounded-full bg-[#B8956A] mt-2" /> : null}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => {
                    setIsNotificationMenuOpen(false);
                    router.push("/admin/notifications");
                  }}
                  className="w-full text-center px-3 py-2 rounded-lg text-[12px] font-semibold bg-white border border-slate-200 text-slate-600 cursor-pointer hover:bg-slate-50"
                >
                  View all notifications
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-[12px] font-bold text-white">
                {avatarLetter}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-[12px] leading-tight font-semibold text-slate-700 max-w-[150px] truncate">{displayName}</p>
              <p className="text-[11px] leading-tight text-slate-400 max-w-[150px] truncate">{userEmail}</p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`text-slate-400 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isProfileMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+10px)] w-52 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  router.push("/admin/profile");
                }}
                className="w-full text-left px-4 py-3 text-[13px] text-slate-700 bg-transparent border-none cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 text-[13px] text-rose-600 bg-transparent border-none cursor-pointer hover:bg-rose-50 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
