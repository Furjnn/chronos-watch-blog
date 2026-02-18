"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";

const SEGMENTS = [
  { value: "ENTRY", label: "Entry", desc: "Under $1,000" },
  { value: "MID_RANGE", label: "Mid-Range", desc: "$1,000 – $5,000" },
  { value: "LUXURY", label: "Luxury", desc: "$5,000 – $20,000" },
  { value: "ULTRA_LUXURY", label: "Ultra-Luxury", desc: "$20,000+" },
];

export default function BrandForm({ brand }: { brand?: any }) {
  const router = useRouter();
  const isEdit = !!brand;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: brand?.name || "", slug: brand?.slug || "", country: brand?.country || "",
    founded: brand?.founded?.toString() || "", priceSegment: brand?.priceSegment || "LUXURY",
    description: brand?.description || "", logo: brand?.logo || "", heroImage: brand?.heroImage || "", website: brand?.website || "",
  });

  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.country.trim()) { alert("Name and country are required"); return; }
    setSaving(true);
    const payload = { ...form, founded: form.founded ? parseInt(form.founded) : null };
    try {
      const url = isEdit ? `/api/admin/brands/${brand.id}` : "/api/admin/brands";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); alert(err.error); setSaving(false); return; }
      router.push("/admin/brands"); router.refresh();
    } catch { alert("Something went wrong"); setSaving(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/brands")} className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{isEdit ? "Edit Brand" : "New Brand"}</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">Fill in the brand details below</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors shadow-sm">
          {saving ? "Saving..." : isEdit ? "Update Brand" : "Create Brand"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Basic Information</h2></div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Brand Name *</label>
                  <input value={form.name} onChange={e => { u("name", e.target.value); if (!isEdit) u("slug", autoSlug(e.target.value)); }} placeholder="e.g. Rolex" className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Slug</label>
                  <div className="flex items-center px-4 py-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-[13px] text-slate-400 mr-1">/brands/</span>
                    <input value={form.slug} onChange={e => u("slug", e.target.value)} className="flex-1 text-[14px] text-slate-700 border-none outline-none bg-transparent" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Country *</label><input value={form.country} onChange={e => u("country", e.target.value)} placeholder="Switzerland" className={inputClass} /></div>
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Founded</label><input type="number" value={form.founded} onChange={e => u("founded", e.target.value)} placeholder="1905" className={inputClass} /></div>
              </div>
              <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Description</label><textarea value={form.description} onChange={e => u("description", e.target.value)} rows={4} placeholder="Brief description..." className={`${inputClass} resize-y leading-relaxed`} /></div>
              <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Website</label><input value={form.website} onChange={e => u("website", e.target.value)} placeholder="https://www.rolex.com" className={inputClass} /></div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Price Segment</h2></div>
            <div className="p-4 space-y-2">
              {SEGMENTS.map(seg => (
                <button key={seg.value} type="button" onClick={() => u("priceSegment", seg.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-all text-left ${form.priceSegment === seg.value ? "border-[#B8956A] bg-[#B8956A]/5 ring-1 ring-[#B8956A]/20" : "border-slate-100 hover:border-slate-200 bg-transparent"}`}>
                  <div>
                    <div className={`text-[14px] font-medium ${form.priceSegment === seg.value ? "text-[#B8956A]" : "text-slate-700"}`}>{seg.label}</div>
                    <div className="text-[12px] text-slate-400">{seg.desc}</div>
                  </div>
                  {form.priceSegment === seg.value && <div className="w-5 h-5 rounded-full bg-[#B8956A] flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Logo</h2></div>
            <div className="p-5">
              <ImageUpload value={form.logo} onChange={(url) => u("logo", url)} aspectRatio="1/1" />
            </div>
          </div>

          {/* Hero Image Upload */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Hero Image</h2></div>
            <div className="p-5">
              <ImageUpload value={form.heroImage} onChange={(url) => u("heroImage", url)} aspectRatio="16/9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
