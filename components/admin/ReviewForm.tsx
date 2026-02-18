"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ImageUpload from "./ImageUpload";
import type { JSONContent } from "@tiptap/core";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), { ssr: false, loading: () => <div className="h-[300px] bg-slate-50 rounded-xl animate-pulse" /> });

interface ReviewValue {
  id: string;
  title: string;
  slug: string;
  watchRef: string;
  rating: number;
  verdict: string | null;
  body: unknown;
  status: string;
  authorId: string;
  brandId: string;
  priceMin: number | null;
  priceMax: number | null;
  seoTitle: string | null;
  seoDesc: string | null;
  specs: unknown;
  prosAndCons: unknown;
  gallery: unknown;
  author?: { id: string } | null;
  brand?: { id: string } | null;
}

interface Props {
  review?: ReviewValue;
  authors: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

interface ReviewFormState {
  title: string;
  slug: string;
  watchRef: string;
  rating: number;
  verdict: string;
  body: JSONContent | string | null;
  status: string;
  authorId: string;
  brandId: string;
  priceMin: string;
  priceMax: string;
  seoTitle: string;
  seoDesc: string;
}

const SPEC_FIELDS = [
  { key: "caseSize", label: "Case Size", placeholder: "41mm" },
  { key: "caseMaterial", label: "Case Material", placeholder: "Stainless steel" },
  { key: "caseThickness", label: "Case Thickness", placeholder: "12.5mm" },
  { key: "waterResistance", label: "Water Resistance", placeholder: "300m" },
  { key: "crystal", label: "Crystal", placeholder: "Sapphire" },
  { key: "movement", label: "Movement", placeholder: "Calibre 3235" },
  { key: "movementType", label: "Movement Type", placeholder: "Automatic" },
  { key: "powerReserve", label: "Power Reserve", placeholder: "70 hours" },
  { key: "frequency", label: "Frequency", placeholder: "28,800 vph" },
  { key: "bracelet", label: "Bracelet", placeholder: "Oyster" },
  { key: "clasp", label: "Clasp", placeholder: "Oysterlock" },
];

export default function ReviewForm({ review, authors, brands }: Props) {
  const router = useRouter();
  const isEdit = !!review;
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [form, setForm] = useState<ReviewFormState>({
    title: review?.title || "", slug: review?.slug || "", watchRef: review?.watchRef || "",
    rating: review?.rating || 8, verdict: review?.verdict || "", body: (review?.body as JSONContent | string | null) || null,
    status: review?.status || "DRAFT",
    authorId: review?.authorId || review?.author?.id || authors[0]?.id || "",
    brandId: review?.brandId || review?.brand?.id || brands[0]?.id || "",
    priceMin: review?.priceMin?.toString() || "", priceMax: review?.priceMax?.toString() || "",
    seoTitle: review?.seoTitle || "", seoDesc: review?.seoDesc || "",
  });

  const [specs, setSpecs] = useState<Record<string, string>>((review?.specs as Record<string, string>) || {});
  const [pros, setPros] = useState<string[]>((review?.prosAndCons as { pros?: string[] } | undefined)?.pros || [""]);
  const [cons, setCons] = useState<string[]>((review?.prosAndCons as { cons?: string[] } | undefined)?.cons || [""]);
  const [gallery, setGallery] = useState<string[]>((review?.gallery as string[]) || []);

  const u = <K extends keyof ReviewFormState>(k: K, v: ReviewFormState[K]) => setForm(p => ({ ...p, [k]: v }));
  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async (status?: string) => {
    if (!form.title.trim() || !form.brandId) { alert("Title and brand are required"); return; }
    setSaving(true);
    const payload = {
      ...form, status: status || form.status,
      priceMin: form.priceMin ? parseInt(form.priceMin) : null,
      priceMax: form.priceMax ? parseInt(form.priceMax) : null,
      specs, prosAndCons: { pros: pros.filter(p => p.trim()), cons: cons.filter(c => c.trim()) },
      gallery: gallery.filter(g => g.trim()),
    };
    try {
      const url = isEdit ? `/api/admin/reviews/${review.id}` : "/api/admin/reviews";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); alert(err.error); setSaving(false); return; }
      router.push("/admin/reviews"); router.refresh();
    } catch { alert("Something went wrong"); setSaving(false); }
  };

  const updateList = (list: string[], setList: (l: string[]) => void, i: number, val: string) => { const n = [...list]; n[i] = val; setList(n); };
  const addToList = (list: string[], setList: (l: string[]) => void) => setList([...list, ""]);
  const removeFromList = (list: string[], setList: (l: string[]) => void, i: number) => setList(list.filter((_, idx) => idx !== i));

  const addGalleryImage = (url: string) => { if (url) setGallery(prev => [...prev, url]); };
  const removeGalleryImage = (i: number) => setGallery(prev => prev.filter((_, idx) => idx !== i));

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300";

  const tabs = [
    { id: "details", label: "Details" },
    { id: "gallery", label: "Gallery" },
    { id: "specs", label: "Specifications" },
    { id: "proscons", label: "Pros & Cons" },
    { id: "content", label: "Content" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/reviews")} className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{isEdit ? "Edit Review" : "New Review"}</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">Complete all sections for a thorough review</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSubmit("DRAFT")} disabled={saving} className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 cursor-pointer hover:bg-slate-50 disabled:opacity-50 transition-colors">Save Draft</button>
          <button onClick={() => handleSubmit("PUBLISHED")} disabled={saving} className="px-5 py-2.5 bg-[#B8956A] border-none rounded-lg text-[13px] font-semibold text-white cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors shadow-sm">{saving ? "Saving..." : "Publish"}</button>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5 mb-6 w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[12px] font-medium px-4 py-2 rounded-lg border-none cursor-pointer transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"}`}>{tab.label}</button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Watch Details</h2></div>
            <div className="p-6 space-y-5">
              <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Title *</label>
                <input value={form.title} onChange={e => { u("title", e.target.value); if (!isEdit) u("slug", autoSlug(e.target.value)); }} placeholder="e.g. Rolex Submariner 126610LN" className={`${inputClass} !text-[18px] font-medium`} style={{ fontFamily: "var(--font-display)" }} /></div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Reference</label><input value={form.watchRef} onChange={e => u("watchRef", e.target.value)} placeholder="126610LN" className={inputClass} /></div>
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Slug</label>
                  <div className="flex items-center px-4 py-3 border border-slate-200 rounded-lg bg-slate-50"><span className="text-[13px] text-slate-400 mr-1">/reviews/</span><input value={form.slug} onChange={e => u("slug", e.target.value)} className="flex-1 text-[14px] text-slate-700 border-none outline-none bg-transparent" /></div></div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Price Min ($)</label><input type="number" value={form.priceMin} onChange={e => u("priceMin", e.target.value)} placeholder="10250" className={inputClass} /></div>
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Price Max ($)</label><input type="number" value={form.priceMax} onChange={e => u("priceMax", e.target.value)} placeholder="14800" className={inputClass} /></div>
              </div>
              <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Verdict</label>
                <textarea value={form.verdict} onChange={e => u("verdict", e.target.value)} rows={3} placeholder="Your final verdict..." className={`${inputClass} resize-y leading-relaxed`} /></div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Rating</h2></div>
              <div className="p-6 text-center">
                <div className="text-[56px] font-light text-[#B8956A] leading-none mb-1" style={{ fontFamily: "var(--font-display)" }}>{form.rating}</div>
                <div className="text-[13px] text-slate-400 mb-4">out of 10</div>
                <input type="range" min="1" max="10" step="0.1" value={form.rating} onChange={e => u("rating", parseFloat(e.target.value))} className="w-full accent-[#B8956A]" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Attribution</h2></div>
              <div className="p-6 space-y-4">
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Brand *</label>
                  <select value={form.brandId} onChange={e => u("brandId", e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none bg-white cursor-pointer focus:border-[#B8956A]">{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Author</label>
                  <select value={form.authorId} onChange={e => u("authorId", e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none bg-white cursor-pointer focus:border-[#B8956A]">{authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Tab - WITH UPLOAD */}
      {activeTab === "gallery" && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Watch Gallery</h2></div>
            <div className="p-6">
              {/* Existing images grid */}
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {gallery.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200" style={{ aspectRatio: "1" }}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <button onClick={() => removeGalleryImage(i)}
                          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-sm">×</button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{i + 1}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new image */}
              <ImageUpload value="" onChange={(url) => addGalleryImage(url)} aspectRatio="16/9" />
              <p className="text-[12px] text-slate-400 mt-3">{gallery.length} image{gallery.length !== 1 ? "s" : ""} in gallery. The first image will be used as the main photo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Specs Tab */}
      {activeTab === "specs" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-3xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Technical Specifications</h2></div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SPEC_FIELDS.map(sf => (
                <div key={sf.key}><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">{sf.label}</label>
                  <input value={specs[sf.key] || ""} onChange={e => setSpecs(p => ({ ...p, [sf.key]: e.target.value }))} placeholder={sf.placeholder} className={inputClass} /></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pros & Cons Tab */}
      {activeTab === "proscons" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50"><h2 className="text-[14px] font-semibold text-emerald-700">✓ Pros</h2></div>
            <div className="p-5 space-y-3">
              {pros.map((p, i) => (
                <div key={i} className="flex gap-2"><input value={p} onChange={e => updateList(pros, setPros, i, e.target.value)} placeholder="Add a pro..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-emerald-400" />
                  <button onClick={() => removeFromList(pros, setPros, i)} className="text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer text-lg">×</button></div>
              ))}
              <button onClick={() => addToList(pros, setPros)} className="text-[12px] text-emerald-600 font-medium bg-transparent border-none cursor-pointer hover:underline">+ Add pro</button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50/50"><h2 className="text-[14px] font-semibold text-red-700">✕ Cons</h2></div>
            <div className="p-5 space-y-3">
              {cons.map((c, i) => (
                <div key={i} className="flex gap-2"><input value={c} onChange={e => updateList(cons, setCons, i, e.target.value)} placeholder="Add a con..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[14px] outline-none focus:border-red-400" />
                  <button onClick={() => removeFromList(cons, setCons, i)} className="text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer text-lg">×</button></div>
              ))}
              <button onClick={() => addToList(cons, setCons)} className="text-[12px] text-red-600 font-medium bg-transparent border-none cursor-pointer hover:underline">+ Add con</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div className="max-w-4xl"><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Review Body</label>
          <TiptapEditor content={form.body} onChange={(json) => u("body", json)} /></div>
      )}

      {activeTab === "seo" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">SEO</h2></div>
          <div className="p-6 space-y-5">
            <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">SEO Title</label><input value={form.seoTitle} onChange={e => u("seoTitle", e.target.value)} placeholder={form.title} className={inputClass} /></div>
            <div><label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Meta Description</label><textarea value={form.seoDesc} onChange={e => u("seoDesc", e.target.value)} rows={3} className={`${inputClass} resize-y`} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
