"use client";

import Link from "next/link";

interface Props {
  stats: { posts: number; reviews: number; brands: number; drafts: number };
  recentPosts: {
    id: string;
    title: string;
    status: string;
    views: number;
    createdAt: string;
    author: { name: string } | null;
  }[];
  recentReviews: {
    id: string;
    title: string;
    rating: number;
    createdAt: string;
    brand: { name: string } | null;
  }[];
}

type StatKey = keyof Props["stats"];

const STATS: Array<{ key: StatKey; label: string; icon: string; color: string; gradient: string }> = [
  { key: "posts", label: "Published Posts", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z", color: "#3B82F6", gradient: "from-blue-500 to-blue-600" },
  { key: "reviews", label: "Reviews", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", color: "#B8956A", gradient: "from-amber-500 to-amber-600" },
  { key: "brands", label: "Brands", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "#10B981", gradient: "from-emerald-500 to-emerald-600" },
  { key: "drafts", label: "Drafts", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "#F59E0B", gradient: "from-yellow-500 to-orange-500" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardClient({ stats, recentPosts, recentReviews }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Dashboard</h1>
          <p className="text-[13px] text-slate-400 mt-1">Welcome back. Here&apos;s an overview of your site.</p>
        </div>
        <Link href="/admin/posts/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold no-underline hover:bg-[#A07D5A] transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Write New Post
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map(card => (
          <div key={card.key} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={card.icon} /></svg>
              </div>
            </div>
            <div className="text-[36px] font-semibold text-slate-900 leading-none mb-1 tabular-nums">{stats[card.key]}</div>
            <div className="text-[13px] text-slate-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "New Post", href: "/admin/posts/new", desc: "Write an article", color: "#3B82F6" },
          { label: "New Review", href: "/admin/reviews/new", desc: "Review a watch", color: "#B8956A" },
          { label: "Add Brand", href: "/admin/brands/new", desc: "Add to directory", color: "#10B981" },
        ].map(a => (
          <Link key={a.label} href={a.href} className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 no-underline hover:border-[#B8956A]/30 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-200 group-hover:border-[#B8956A]/40 flex items-center justify-center transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{a.label}</div>
              <div className="text-[12px] text-slate-400">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[15px] font-semibold text-slate-800">Recent Posts</h2>
            <Link href="/admin/posts" className="text-[12px] font-medium text-[#B8956A] no-underline hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentPosts.length === 0 ? (
              <div className="px-6 py-10 text-center"><p className="text-[13px] text-slate-400">No posts yet</p><Link href="/admin/posts/new" className="text-[12px] text-[#B8956A] mt-1 inline-block">Create your first post →</Link></div>
            ) : recentPosts.map(p => (
              <Link key={p.id} href={`/admin/posts/${p.id}/edit`} className="flex items-center justify-between px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-slate-700 group-hover:text-[#B8956A] truncate pr-4 transition-colors">{p.title}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">{p.author?.name} · {timeAgo(p.createdAt)}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[12px] text-slate-400 tabular-nums">{p.views} views</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    <span className={`w-1 h-1 rounded-full ${p.status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-400"}`} />{p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[15px] font-semibold text-slate-800">Recent Reviews</h2>
            <Link href="/admin/reviews" className="text-[12px] font-medium text-[#B8956A] no-underline hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentReviews.length === 0 ? (
              <div className="px-6 py-10 text-center"><p className="text-[13px] text-slate-400">No reviews yet</p><Link href="/admin/reviews/new" className="text-[12px] text-[#B8956A] mt-1 inline-block">Create your first review →</Link></div>
            ) : recentReviews.map(r => (
              <Link key={r.id} href={`/admin/reviews/${r.id}/edit`} className="flex items-center justify-between px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-slate-700 group-hover:text-[#B8956A] truncate pr-4 transition-colors">{r.title}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">{r.brand?.name} · {timeAgo(r.createdAt)}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[16px] font-semibold text-[#B8956A]" style={{ fontFamily: "var(--font-display)" }}>{r.rating}</span>
                    <span className="text-[10px] text-slate-400">/10</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
