"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Tag { id: string; name: string; slug: string; _count: { posts: number }; }

export default function TagsClient({ tags }: { tags: Tag[] }) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null); const [editName, setEditName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const add = async () => { if (!name.trim()) return; await fetch("/api/admin/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); setName(""); setShowAdd(false); router.refresh(); };
  const update = async (id: string) => { const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, "-"); await fetch(`/api/admin/tags/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, slug }) }); setEditId(null); router.refresh(); };
  const remove = async (id: string, n: string) => { if (!confirm(`Delete "${n}"?`)) return; await fetch(`/api/admin/tags/${id}`, { method: "DELETE" }); router.refresh(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Tags</h1>
          <p className="text-[13px] text-slate-400 mt-1">{tags.length} tags</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showAdd ? "Cancel" : "Add Tag"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-700 mb-4">New Tag</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-sm">
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tag name..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all" />
            </div>
            <button onClick={add} className="px-6 py-3 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A]">Add</button>
          </div>
        </div>
      )}

      {/* Tag Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.map(tag => (
          <div key={tag.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all group flex items-center justify-between">
            {editId === tag.id ? (
              <div className="flex gap-2 flex-1 items-center">
                <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-[#B8956A]" />
                <button onClick={() => update(tag.id)} className="text-[12px] text-emerald-600 font-semibold bg-transparent border-none cursor-pointer">Save</button>
                <button onClick={() => setEditId(null)} className="text-[12px] text-slate-400 bg-transparent border-none cursor-pointer">Cancel</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <div>
                    <div className="text-[14px] font-medium text-slate-800">{tag.name}</div>
                    <div className="text-[12px] text-slate-400">{tag._count.posts} posts</div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(tag.id); setEditName(tag.name); }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-[#B8956A] bg-transparent border-none cursor-pointer transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => remove(tag.id, tag.name)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
