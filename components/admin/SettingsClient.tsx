"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_ABOUT_PAGE, normalizeAboutPage, type AboutPageContent } from "@/lib/about-page";

type SettingsSocials = {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  aboutPage?: unknown;
};

type SettingsData = {
  siteName?: string | null;
  logo?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  footerText?: string | null;
  analyticsId?: string | null;
  socials?: unknown;
};

function updateArrayItem<T>(list: T[], index: number, patch: Partial<T>) {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

export default function SettingsClient({ settings }: { settings: SettingsData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const socials =
    typeof settings.socials === "object" && settings.socials !== null
      ? (settings.socials as SettingsSocials)
      : undefined;

  const initialAbout = normalizeAboutPage(socials?.aboutPage);

  const [form, setForm] = useState({
    siteName: settings.siteName || "",
    logo: settings.logo || "",
    seoTitle: settings.seoTitle || "",
    seoDescription: settings.seoDescription || "",
    ogImage: settings.ogImage || "",
    footerText: settings.footerText || "",
    analyticsId: settings.analyticsId || "",
    instagram: socials?.instagram || "",
    twitter: socials?.twitter || "",
    youtube: socials?.youtube || "",
    aboutPage: initialAbout,
  });

  const u = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const uAbout = (patch: Partial<AboutPageContent>) => setForm((prev) => ({ ...prev, aboutPage: { ...prev.aboutPage, ...patch } }));

  const updateStat = (index: number, key: "num" | "label", value: string) => {
    setForm((prev) => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        stats: updateArrayItem(prev.aboutPage.stats, index, { [key]: value }),
      },
    }));
  };

  const addStat = () => {
    setForm((prev) => ({
      ...prev,
      aboutPage: { ...prev.aboutPage, stats: [...prev.aboutPage.stats, { num: "", label: "" }] },
    }));
  };

  const removeStat = (index: number) => {
    setForm((prev) => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        stats: prev.aboutPage.stats.filter((_, i) => i !== index),
      },
    }));
  };

  const updateTeam = (index: number, key: "name" | "role" | "bio" | "img", value: string) => {
    setForm((prev) => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        team: updateArrayItem(prev.aboutPage.team, index, { [key]: value }),
      },
    }));
  };

  const addTeamMember = () => {
    setForm((prev) => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        team: [...prev.aboutPage.team, { name: "", role: "", bio: "", img: "" }],
      },
    }));
  };

  const removeTeamMember = (index: number) => {
    setForm((prev) => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        team: prev.aboutPage.team.filter((_, i) => i !== index),
      },
    }));
  };

  const resetAboutToDefault = () => {
    setForm((prev) => ({ ...prev, aboutPage: DEFAULT_ABOUT_PAGE }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          socials: {
            instagram: form.instagram,
            twitter: form.twitter,
            youtube: form.youtube,
            aboutPage: form.aboutPage,
          },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300";
  const labelClass = "text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
          <p className="text-[13px] text-slate-400 mt-1">Manage your site configuration</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors shadow-sm">
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5 mb-6 w-fit">
        {[
          { id: "general", label: "General" },
          { id: "seo", label: "SEO" },
          { id: "social", label: "Social" },
          { id: "about", label: "About" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[12px] font-medium px-4 py-2 rounded-lg border-none cursor-pointer transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">General Settings</h2></div>
          <div className="p-6 space-y-5">
            {[
              ["Site Name", "siteName", "Chronos"],
              ["Logo URL", "logo", "https://..."],
              ["Footer Text", "footerText", "Copyright text"],
              ["Google Analytics ID", "analyticsId", "G-XXXXXXXXXX"],
            ].map(([label, key, placeholder]) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input value={form[key as keyof typeof form] as string} onChange={(e) => u(key, e.target.value)} placeholder={placeholder} className={inputClass} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Default SEO Settings</h2></div>
          <div className="p-6 space-y-5">
            <div>
              <label className={labelClass}>Default Title</label>
              <input value={form.seoTitle} onChange={(e) => u("seoTitle", e.target.value)} placeholder="Chronos - Luxury Watch Journal" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Default Description</label>
              <textarea value={form.seoDescription} onChange={(e) => u("seoDescription", e.target.value)} rows={3} className={`${inputClass} resize-y`} />
            </div>
            <div>
              <label className={labelClass}>Default OG Image</label>
              <input value={form.ogImage} onChange={(e) => u("ogImage", e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "social" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Social Media Links</h2></div>
          <div className="p-6 space-y-5">
            {[
              ["Instagram", "instagram", "https://instagram.com/chronos"],
              ["Twitter / X", "twitter", "https://twitter.com/chronos"],
              ["YouTube", "youtube", "https://youtube.com/chronos"],
            ].map(([label, key, placeholder]) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input value={form[key as keyof typeof form] as string} onChange={(e) => u(key, e.target.value)} placeholder={placeholder} className={inputClass} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "about" && (
        <div className="space-y-6 max-w-5xl">
          <div className="flex items-center justify-end">
            <button onClick={resetAboutToDefault} className="px-4 py-2 text-[12px] font-semibold border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50">
              Reset About to Defaults
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Hero</h2></div>
            <div className="p-6 grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Badge</label>
                <input value={form.aboutPage.heroBadge} onChange={(e) => uAbout({ heroBadge: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input value={form.aboutPage.heroTitle} onChange={(e) => uAbout({ heroTitle: e.target.value })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Subtitle</label>
                <textarea value={form.aboutPage.heroSubtitle} onChange={(e) => uAbout({ heroSubtitle: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Mission</h2></div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Heading</label>
                <input value={form.aboutPage.missionHeading} onChange={(e) => uAbout({ missionHeading: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Paragraph 1</label>
                <textarea value={form.aboutPage.missionParagraphOne} onChange={(e) => uAbout({ missionParagraphOne: e.target.value })} rows={3} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Quote</label>
                <textarea value={form.aboutPage.missionQuote} onChange={(e) => uAbout({ missionQuote: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Paragraph 2</label>
                <textarea value={form.aboutPage.missionParagraphTwo} onChange={(e) => uAbout({ missionParagraphTwo: e.target.value })} rows={3} className={`${inputClass} resize-y`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-700">Stats</h2>
              <button onClick={addStat} className="text-[12px] font-semibold px-3 py-1.5 rounded border border-slate-200 bg-white cursor-pointer">Add Stat</button>
            </div>
            <div className="p-6 space-y-4">
              {form.aboutPage.stats.map((stat, index) => (
                <div key={`stat-${index}`} className="grid md:grid-cols-[1fr_2fr_auto] gap-3 items-end">
                  <div>
                    <label className={labelClass}>Number</label>
                    <input value={stat.num} onChange={(e) => updateStat(index, "num", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Label</label>
                    <input value={stat.label} onChange={(e) => updateStat(index, "label", e.target.value)} className={inputClass} />
                  </div>
                  <button onClick={() => removeStat(index)} className="h-[44px] px-3 rounded border border-red-200 text-red-600 bg-red-50 cursor-pointer">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-[14px] font-semibold text-slate-700">Team Section</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Section Badge</label>
                <input value={form.aboutPage.teamBadge} onChange={(e) => uAbout({ teamBadge: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Section Heading</label>
                <input value={form.aboutPage.teamHeading} onChange={(e) => uAbout({ teamHeading: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-700">Team Members</h2>
              <button onClick={addTeamMember} className="text-[12px] font-semibold px-3 py-1.5 rounded border border-slate-200 bg-white cursor-pointer">Add Member</button>
            </div>
            <div className="p-6 space-y-6">
              {form.aboutPage.team.map((member, index) => (
                <div key={`member-${index}`} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input value={member.name} onChange={(e) => updateTeam(index, "name", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Role</label>
                      <input value={member.role} onChange={(e) => updateTeam(index, "role", e.target.value)} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Bio</label>
                      <textarea value={member.bio} onChange={(e) => updateTeam(index, "bio", e.target.value)} rows={2} className={`${inputClass} resize-y`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Image URL</label>
                      <input value={member.img} onChange={(e) => updateTeam(index, "img", e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => removeTeamMember(index)} className="px-3 py-1.5 rounded border border-red-200 text-red-600 bg-red-50 cursor-pointer">Remove Member</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h2 className="text-[14px] font-semibold text-slate-700">Contact Section</h2></div>
            <div className="p-6 grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Heading</label>
                <input value={form.aboutPage.contactHeading} onChange={(e) => uAbout({ contactHeading: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Button Label</label>
                <input value={form.aboutPage.contactButtonLabel} onChange={(e) => uAbout({ contactButtonLabel: e.target.value })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Subtitle</label>
                <textarea value={form.aboutPage.contactSubtitle} onChange={(e) => uAbout({ contactSubtitle: e.target.value })} rows={2} className={`${inputClass} resize-y`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
