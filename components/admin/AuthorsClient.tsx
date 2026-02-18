"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Author { id: string; name: string; slug: string; role: string | null; bio: string | null; avatar: string | null; _count: { posts: number; reviews: number }; }

export default function AuthorsClient({ authors }: { authors: Author[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState(""); const [role, setRole] = useState(""); const [bio, setBio] = useState("");
  const router = useRouter();

  const add = async () => {
    if (!name.trim()) return;
    await fetch("/api/admin/authors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, role, bio }) });
    setName(""); setRole(""); setBio(""); setShowAdd(false); router.refresh();
  };
  const remove = async (id: string, n: string) => { if (!confirm(`Delete "${n}"?`)) return; await fetch(`/api/admin/authors/${id}`, { method: "DELETE" }); router.refresh(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Authors</h1>
          <p className="text-[13px] text-slate-400 mt-1">{authors.length} team members</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showAdd ? "Cancel" : "Add Author"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h3 className="text-[14px] font-semibold text-slate-700">New Author</h3></div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Role</label>
                <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Editor"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="Brief biography..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none resize-y focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10" />
            </div>
            <button onClick={add} className="px-6 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A]">Create Author</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {authors.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[18px] font-semibold text-slate-500 flex-shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                {a.name.split(" ").map(w => w[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-slate-800">{a.name}</h3>
                  <button onClick={() => remove(a.id, a.name)} className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
                {a.role && <p className="text-[12px] text-[#B8956A] font-semibold mt-0.5">{a.role}</p>}
                {a.bio && <p className="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{a.bio}</p>}
                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-[16px] font-semibold text-slate-700">{a._count.posts}</div>
                    <div className="text-[11px] text-slate-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[16px] font-semibold text-slate-700">{a._count.reviews}</div>
                    <div className="text-[11px] text-slate-400">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
