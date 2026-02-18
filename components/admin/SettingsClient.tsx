"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsClient({ settings }: { settings: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({
    siteName: settings.siteName || "", logo: settings.logo || "",
    seoTitle: settings.seoTitle || "", seoDescription: settings.seoDescription || "", ogImage: settings.ogImage || "",
    footerText: settings.footerText || "", analyticsId: settings.analyticsId || "",
    instagram: (settings.socials as any)?.instagram || "", twitter: (settings.socials as any)?.twitter || "",
    youtube: (settings.socials as any)?.youtube || "",
  });
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, socials: { instagram: form.instagram, twitter: form.twitter, youtube: form.youtube } }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); router.refresh();
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
          <p className="text-[13px] text-slate-400 mt-1">Manage your site configuration</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors shadow-sm">
          {saved ? (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg> Saved!</>
          ) : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5 mb-6 w-fit">
        {[{ id: "general", label: "General" }, { id: "seo", label: "SEO" }, { id: "social", label: "Social" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[12px] font-medium px-4 py-2 rounded-lg border-none cursor-pointer transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">General Settings</h2></div>
          <div className="p-6 space-y-5">
            {[["Site Name", "siteName", "Chronos"], ["Logo URL", "logo", "https://..."], ["Footer Text", "footerText", "© 2026 Chronos. All rights reserved."], ["Google Analytics ID", "analyticsId", "G-XXXXXXXXXX"]].map(([label, key, ph]) => (
              <div key={key}>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">{label}</label>
                <input value={(form as any)[key]} onChange={e => u(key, e.target.value)} placeholder={ph} className={inputClass} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Default SEO Settings</h2></div>
          <div className="p-6 space-y-5">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-2">
              <p className="text-[11px] text-slate-400 mb-2 font-semibold uppercase tracking-wider">Google Preview</p>
              <p className="text-[16px] text-blue-700 mb-0.5 truncate">{form.seoTitle || form.siteName || "Site Title"}</p>
              <p className="text-[12px] text-emerald-700 mb-1">chronos.blog</p>
              <p className="text-[13px] text-slate-500 line-clamp-2">{form.seoDescription || "Your site description..."}</p>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Default Title</label>
              <input value={form.seoTitle} onChange={e => u("seoTitle", e.target.value)} placeholder="Chronos — Luxury Watch Journal" className={inputClass} />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Default Description</label>
              <textarea value={form.seoDescription} onChange={e => u("seoDescription", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Default OG Image</label>
              {form.ogImage && <img src={form.ogImage} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />}
              <input value={form.ogImage} onChange={e => u("ogImage", e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "social" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Social Media Links</h2></div>
          <div className="p-6 space-y-5">
            {[
              ["Instagram", "instagram", "https://instagram.com/chronos", "M12 2.163c3.204 0 3.584.012 4.85.07"],
              ["Twitter / X", "twitter", "https://twitter.com/chronos", "M23 3a10.9 10.9 0 01-3.14 1.53"],
              ["YouTube", "youtube", "https://youtube.com/chronos", "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">{label}</label>
                <input value={(form as any)[key]} onChange={e => u(key, e.target.value)} placeholder={ph} className={inputClass} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
