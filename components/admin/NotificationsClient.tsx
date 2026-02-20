"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationSeverity = "info" | "success" | "warning" | "critical";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  severity: NotificationSeverity;
  unread: boolean;
  createdAt: string;
  postId: string | null;
  reviewId: string | null;
  commentId: string | null;
  details: unknown;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityBadgeClass(severity: NotificationSeverity) {
  if (severity === "critical") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (severity === "warning") return "bg-amber-50 text-amber-700 border border-amber-200";
  if (severity === "success") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
}

export default function NotificationsClient({
  initialItems,
  initialUnreadCount,
}: {
  initialItems: NotificationItem[];
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");

  const visibleItems = useMemo(() => {
    if (activeTab === "UNREAD") return items.filter((item) => item.unread);
    return items;
  }, [activeTab, items]);

  const markRead = async (ids: string[], all = false) => {
    if (ids.length === 0 && !all) return;
    setLoading(true);
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(all ? { all: true } : { ids }),
      });

      const idSet = new Set(ids);
      const markedCount = all
        ? unreadCount
        : items.reduce((count, item) => (
            item.unread && idSet.has(item.id) ? count + 1 : count
          ), 0);

      setItems((prev) =>
        prev.map((item) => (
          all || idSet.has(item.id)
            ? { ...item, unread: false }
            : item
        )),
      );
      setUnreadCount((prev) => (all ? 0 : Math.max(0, prev - markedCount)));
    } finally {
      setLoading(false);
    }
  };

  const openItem = async (item: NotificationItem) => {
    if (item.unread) {
      await markRead([item.id]);
    }
    router.push(item.href || "/admin/notifications");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Notifications
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Scheduler events, system health alerts, and security-sensitive updates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2 rounded-lg text-[12px] font-semibold border cursor-pointer ${activeTab === "ALL" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("UNREAD")}
            className={`px-3.5 py-2 rounded-lg text-[12px] font-semibold border cursor-pointer ${activeTab === "UNREAD" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => markRead([], true)}
            disabled={loading || unreadCount === 0}
            className="px-3.5 py-2 rounded-lg text-[12px] font-semibold border border-slate-200 bg-white text-slate-600 cursor-pointer disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Time</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Title</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Message</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Type</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-10 text-[13px] text-slate-400">
                    {activeTab === "UNREAD" ? "No unread notifications." : "No notifications yet."}
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50/60 ${item.unread ? "bg-[#FFFDF8]" : ""}`}>
                    <td className="px-5 py-3 text-[12px] text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityBadgeClass(item.severity)}`}>
                          {item.severity.toUpperCase()}
                        </span>
                        {item.unread ? (
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#B8956A]/15 text-[#8A6A41]">
                            UNREAD
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">{item.title}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">
                      <div className="max-w-[520px]">
                        <p>{item.message}</p>
                        {item.details ? (
                          <pre className="mt-1.5 text-[10px] text-slate-400 whitespace-pre-wrap break-all">
                            {JSON.stringify(item.details, null, 2)}
                          </pre>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400">{item.type}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {item.unread ? (
                          <button
                            onClick={() => markRead([item.id])}
                            disabled={loading}
                            className="px-3 py-1.5 rounded border border-slate-200 bg-white text-[12px] text-slate-600 cursor-pointer disabled:opacity-50"
                          >
                            Mark read
                          </button>
                        ) : null}
                        <button
                          onClick={() => openItem(item)}
                          className="px-3 py-1.5 rounded border border-[#B8956A] bg-[#B8956A] text-[12px] text-white cursor-pointer hover:bg-[#A07D5A]"
                        >
                          Open
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
