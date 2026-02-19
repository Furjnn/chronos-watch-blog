"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ImageUpload from "./ImageUpload";
import type { JSONContent } from "@tiptap/core";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), { ssr: false, loading: () => <div className="h-[400px] bg-slate-50 rounded-xl animate-pulse" /> });

interface PostValue {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: unknown;
  coverImage: string | null;
  status: string;
  featured: boolean;
  readingTime: number | null;
  authorId: string;
  brandId: string | null;
  categories: { id: string }[];
  tags: { id: string }[];
  seoTitle: string | null;
  seoDesc: string | null;
  ogImage: string | null;
  scheduledAt: string | Date | null;
  author?: { id: string } | null;
  brand?: { id: string } | null;
}

interface Props {
  post?: PostValue;
  authors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

interface PostFormState {
  title: string;
  slug: string;
  excerpt: string;
  body: JSONContent | string | null;
  coverImage: string;
  status: string;
  featured: boolean;
  readingTime: string;
  authorId: string;
  brandId: string;
  categoryIds: string[];
  tagIds: string[];
  seoTitle: string;
  seoDesc: string;
  ogImage: string;
  scheduledAt: string;
}

export default function PostForm({ post, authors, categories, tags, brands }: Props) {
  const router = useRouter();
  const isEdit = !!post;
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const [form, setForm] = useState<PostFormState>({
    title: post?.title || "", slug: post?.slug || "", excerpt: post?.excerpt || "",
    body: (post?.body as JSONContent | string | null) || null, coverImage: post?.coverImage || "", status: post?.status || "DRAFT",
    featured: post?.featured || false, readingTime: post?.readingTime?.toString() || "",
    authorId: post?.authorId || post?.author?.id || authors[0]?.id || "",
    brandId: post?.brandId || post?.brand?.id || "",
    categoryIds: post?.categories?.map((c) => c.id) || [],
    tagIds: post?.tags?.map((t) => t.id) || [],
    seoTitle: post?.seoTitle || "", seoDesc: post?.seoDesc || "", ogImage: post?.ogImage || "",
    scheduledAt:
      post?.scheduledAt && !Number.isNaN(new Date(post.scheduledAt).getTime())
        ? new Date(post.scheduledAt).toISOString().slice(0, 16)
        : "",
  });

  const u = <K extends keyof PostFormState>(k: K, v: PostFormState[K]) => setForm(p => ({ ...p, [k]: v }));
  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async (status?: string, forceSchedule = false) => {
    if (!form.title.trim()) { alert("Title is required"); return; }
    if (forceSchedule && !form.scheduledAt) { alert("Select a schedule date and time first."); return; }
    setSaving(true);
    const payload = {
      ...form,
      status: forceSchedule ? "DRAFT" : (status || form.status),
      readingTime: form.readingTime ? parseInt(form.readingTime) : null,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
    };
    try {
      const url = isEdit ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); alert(err.error); setSaving(false); return; }
      router.push("/admin/posts"); router.refresh();
    } catch { alert("Something went wrong"); setSaving(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/posts")} className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-[26px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>{isEdit ? "Edit Post" : "New Post"}</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">{isEdit ? `Editing "${post.title}"` : "Create a new article"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEdit && form.status === "PUBLISHED" && <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">PUBLISHED</span>}
          <button onClick={() => handleSubmit("DRAFT")} disabled={saving} className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 cursor-pointer hover:bg-slate-50 disabled:opacity-50 transition-colors">Save Draft</button>
          <button onClick={() => handleSubmit("DRAFT", true)} disabled={saving} className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 cursor-pointer hover:bg-slate-50 disabled:opacity-50 transition-colors">Schedule</button>
          <button onClick={() => handleSubmit("PUBLISHED")} disabled={saving} className="px-5 py-2.5 bg-[#B8956A] border-none rounded-lg text-[13px] font-semibold text-white cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors shadow-sm">{saving ? "Saving..." : "Publish"}</button>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5 mb-6 w-fit">
        {[{ id: "content", label: "Content" }, { id: "seo", label: "SEO" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[12px] font-medium px-4 py-2 rounded-lg border-none cursor-pointer transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"}`}>{tab.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          {activeTab === "content" ? (
            <>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Article Details</h2></div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Title *</label>
                    <input value={form.title} onChange={e => { u("title", e.target.value); if (!isEdit) u("slug", autoSlug(e.target.value)); }} placeholder="Enter a compelling title..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[20px] font-medium text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300" style={{ fontFamily: "var(--font-display)" }} />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Slug</label>
                    <div className="flex items-center px-4 py-3 border border-slate-200 rounded-lg bg-slate-50">
                      <span className="text-[13px] text-slate-400 mr-1">/blog/</span>
                      <input value={form.slug} onChange={e => u("slug", e.target.value)} className="flex-1 text-[14px] text-slate-700 border-none outline-none bg-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Excerpt</label>
                    <textarea value={form.excerpt} onChange={e => u("excerpt", e.target.value)} rows={3} placeholder="Brief summary..." className={`${inputClass} resize-y leading-relaxed`} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Content</label>
                <TiptapEditor content={form.body} onChange={(json) => u("body", json)} />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Search Engine Optimization</h2></div>
              <div className="p-6 space-y-5">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2 font-semibold uppercase tracking-wider">Google Preview</p>
                  <p className="text-[16px] text-blue-700 mb-0.5 truncate">{form.seoTitle || form.title || "Page Title"}</p>
                  <p className="text-[12px] text-emerald-700 mb-1">chronos.blog/blog/{form.slug || "post-slug"}</p>
                  <p className="text-[13px] text-slate-500 line-clamp-2">{form.seoDesc || form.excerpt || "Meta description..."}</p>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">SEO Title</label>
                  <input value={form.seoTitle} onChange={e => u("seoTitle", e.target.value)} placeholder={form.title} className={inputClass} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Meta Description</label>
                  <textarea value={form.seoDesc} onChange={e => u("seoDesc", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">OG Image</label>
                  <ImageUpload value={form.ogImage} onChange={(url) => u("ogImage", url)} aspectRatio="1200/630" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Cover Image - NOW WITH UPLOAD */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Cover Image</h2></div>
            <div className="p-5">
              <ImageUpload value={form.coverImage} onChange={(url) => u("coverImage", url)} aspectRatio="16/10" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Author & Brand</h2></div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Author *</label>
                <select value={form.authorId} onChange={e => u("authorId", e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none bg-white cursor-pointer focus:border-[#B8956A]">
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Brand</label>
                <select value={form.brandId} onChange={e => u("brandId", e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] outline-none bg-white cursor-pointer focus:border-[#B8956A]">
                  <option value="">None</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Categories</h2></div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const sel = form.categoryIds.includes(cat.id);
                  return (
                    <button key={cat.id} type="button" onClick={() => u("categoryIds", sel ? form.categoryIds.filter((i: string) => i !== cat.id) : [...form.categoryIds, cat.id])}
                      className={`text-[12px] px-3.5 py-2 rounded-lg border cursor-pointer transition-all font-medium ${sel ? "bg-[#B8956A] text-white border-[#B8956A] shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>{cat.name}</button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Tags</h2></div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const sel = form.tagIds.includes(tag.id);
                  return (
                    <button key={tag.id} type="button" onClick={() => u("tagIds", sel ? form.tagIds.filter((i: string) => i !== tag.id) : [...form.tagIds, tag.id])}
                      className={`text-[12px] px-3.5 py-2 rounded-lg border cursor-pointer transition-all font-medium ${sel ? "bg-slate-800 text-white border-slate-800 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>{tag.name}</button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Options</h2></div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div><div className="text-[13px] font-medium text-slate-700">Featured Post</div><div className="text-[11px] text-slate-400">Show in featured section</div></div>
                <button type="button" onClick={() => u("featured", !form.featured)} className={`w-11 h-6 rounded-full border-none cursor-pointer transition-all relative ${form.featured ? "bg-[#B8956A]" : "bg-slate-200"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? "translate-x-[22px]" : "translate-x-1"}`} />
                </button>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Reading Time (min)</label>
                <input type="number" value={form.readingTime} onChange={e => u("readingTime", e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#B8956A] transition-colors" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Schedule Publish At</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => u("scheduledAt", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#B8956A] transition-colors"
                />
                <p className="mt-1 text-[11px] text-slate-400">Set a future date and click Schedule.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
