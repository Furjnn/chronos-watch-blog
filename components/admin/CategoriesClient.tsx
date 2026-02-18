"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Cat { id: string; name: string; slug: string; icon: string | null; _count: { posts: number }; }

export default function CategoriesClient({ categories }: { categories: Cat[] }) {
  const [name, setName] = useState(""); const [icon, setIcon] = useState("");
  const [editId, setEditId] = useState<string | null>(null); const [editName, setEditName] = useState(""); const [editIcon, setEditIcon] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const add = async () => {
    if (!name.trim()) return;
    await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, icon }) });
    setName(""); setIcon(""); setShowAdd(false); router.refresh();
  };
  const update = async (id: string) => {
    const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await fetch(`/api/admin/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, slug, icon: editIcon }) });
    setEditId(null); router.refresh();
  };
  const remove = async (id: string, n: string) => {
    if (!confirm(`Delete "${n}"?`)) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" }); router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Categories</h1>
          <p className="text-[13px] text-slate-400 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showAdd ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-700 mb-4">New Category</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all" />
            </div>
            <div className="w-20">
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Icon</label>
              <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="★"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none text-center focus:border-[#B8956A]" />
            </div>
            <button onClick={add} className="px-6 py-3 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] transition-colors">Add</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors group">
              {editId === cat.id ? (
                <div className="flex gap-3 flex-1 items-center">
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 max-w-xs px-4 py-2 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-[#B8956A]" />
                  <input value={editIcon} onChange={e => setEditIcon(e.target.value)} className="w-14 px-3 py-2 border border-slate-200 rounded-lg text-[14px] outline-none text-center" />
                  <button onClick={() => update(cat.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[12px] font-semibold border-none cursor-pointer">Save</button>
                  <button onClick={() => setEditId(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[12px] font-medium border-none cursor-pointer">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-lg">{cat.icon || "○"}</div>
                    <div>
                      <div className="text-[14px] font-medium text-slate-800">{cat.name}</div>
                      <div className="text-[12px] text-slate-400 mt-0.5">{cat._count.posts} posts · /{cat.slug}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditIcon(cat.icon || ""); }}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#B8956A] bg-transparent border-none cursor-pointer transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => remove(cat.id, cat.name)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
