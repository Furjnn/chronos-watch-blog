"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Post {
  id: string; title: string; slug: string; status: string; featured: boolean;
  views: number; publishedAt: string | null; createdAt: string;
  author: { name: string }; categories: { name: string }[];
}

const statusStyles: Record<string, { bg: string; dot: string; text: string }> = {
  PUBLISHED: { bg: "bg-emerald-50", dot: "bg-emerald-500", text: "text-emerald-700" },
  DRAFT: { bg: "bg-amber-50", dot: "bg-amber-400", text: "text-amber-700" },
  ARCHIVED: { bg: "bg-slate-100", dot: "bg-slate-400", text: "text-slate-500" },
};

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

export default function PostsListClient({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const counts = { all: posts.length, published: posts.filter(p => p.status === "PUBLISHED").length, draft: posts.filter(p => p.status === "DRAFT").length };
  const filtered = posts.filter(p => {
    if (filter !== "all" && p.status !== filter.toUpperCase()) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" will be permanently deleted. Are you sure?`)) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Posts</h1>
          <p className="text-[13px] text-slate-400 mt-1">Manage your blog articles and stories</p>
        </div>
        <Link href="/admin/posts/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold no-underline hover:bg-[#A07D5A] transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Post
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5">
          {[
            { key: "all", label: "All", count: counts.all },
            { key: "published", label: "Published", count: counts.published },
            { key: "draft", label: "Drafts", count: counts.draft },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-[12px] font-medium px-3.5 py-2 rounded-lg border-none cursor-pointer transition-all flex items-center gap-2 ${
                filter === f.key ? "bg-slate-900 text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-white/20" : "bg-slate-100"}`}>{f.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl w-72">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="border-none outline-none bg-transparent text-[13px] text-slate-700 flex-1 placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-sm">×</button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Article</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-32">Author</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Status</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-24">Views</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Date</th>
              <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16">
                <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1"/></svg>
                <p className="text-[14px] text-slate-500 font-medium">No posts found</p>
                <p className="text-[12px] text-slate-400 mt-1">Try adjusting your search or filter</p>
              </td></tr>
            ) : filtered.map(post => {
              const st = statusStyles[post.status] || statusStyles.DRAFT;
              return (
                <tr key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/posts/${post.id}/edit`} className="no-underline">
                      <div className="flex items-center gap-3">
                        {post.featured && (
                          <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center flex-shrink-0" title="Featured">
                            <span className="text-amber-500 text-[11px]">★</span>
                          </div>
                        )}
                        <div>
                          <div className="text-[14px] font-medium text-slate-800 group-hover:text-[#B8956A] transition-colors leading-snug">{post.title}</div>
                          <div className="text-[12px] text-slate-400 mt-0.5">{post.categories.map(c => c.name).join(", ") || "Uncategorized"}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500">{post.author.name}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500 tabular-nums">{post.views.toLocaleString()}</td>
                  <td className="px-4 py-4 text-[13px] text-slate-400">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/posts/${post.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#B8956A] no-underline transition-colors" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </Link>
                      <button onClick={() => handleDelete(post.id, post.title)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors" title="Delete">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
