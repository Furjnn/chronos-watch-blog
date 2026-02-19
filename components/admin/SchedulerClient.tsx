"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ScheduledItem = {
  id: string;
  title: string;
  scheduledAt: string | null;
  meta: string;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SchedulerClient({
  dueNow,
  posts,
  reviews,
}: {
  dueNow: { posts: number; reviews: number };
  posts: ScheduledItem[];
  reviews: ScheduledItem[];
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [runSummary, setRunSummary] = useState<string>("");

  const runScheduler = async () => {
    setRunning(true);
    const response = await fetch("/api/admin/scheduler/run", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(data.error || "Unable to run scheduler");
      setRunning(false);
      return;
    }
    setRunSummary(
      `Published ${data.summary?.publishedPosts || 0} posts and ${data.summary?.publishedReviews || 0} reviews.`,
    );
    setRunning(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Scheduler
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Manage scheduled publishing and run manual publication checks.
          </p>
        </div>
        <button
          onClick={runScheduler}
          disabled={running}
          className="px-4 py-2.5 rounded-lg bg-[#B8956A] text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-60"
        >
          {running ? "Running..." : "Run Now"}
        </button>
      </div>

      {runSummary && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] text-emerald-700">
          {runSummary}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.8px]">Due now</p>
          <p className="mt-1 text-[24px] font-semibold text-slate-900">{dueNow.posts + dueNow.reviews}</p>
          <p className="text-[12px] text-slate-500 mt-1">
            {dueNow.posts} posts and {dueNow.reviews} reviews are ready to publish.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.8px]">Scheduled total</p>
          <p className="mt-1 text-[24px] font-semibold text-slate-900">{posts.length + reviews.length}</p>
          <p className="text-[12px] text-slate-500 mt-1">
            {posts.length} posts and {reviews.length} reviews currently in queue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 text-[13px] font-semibold text-slate-700">
            Scheduled Posts
          </div>
          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {posts.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-slate-400 text-center">No scheduled posts.</div>
            ) : (
              posts.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/posts/${item.id}/edit`}
                  className="block px-5 py-3.5 no-underline hover:bg-slate-50/70 transition-colors"
                >
                  <div className="text-[13px] font-semibold text-slate-700">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {item.meta} - {formatDate(item.scheduledAt)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 text-[13px] font-semibold text-slate-700">
            Scheduled Reviews
          </div>
          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {reviews.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-slate-400 text-center">No scheduled reviews.</div>
            ) : (
              reviews.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/reviews/${item.id}/edit`}
                  className="block px-5 py-3.5 no-underline hover:bg-slate-50/70 transition-colors"
                >
                  <div className="text-[13px] font-semibold text-slate-700">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {item.meta} - {formatDate(item.scheduledAt)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
