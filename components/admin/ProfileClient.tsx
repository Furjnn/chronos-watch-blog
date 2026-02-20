"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";

type SocialLinkKey = "website" | "twitter" | "instagram" | "linkedin" | "youtube" | "github";

interface ProfileFormData {
  id: string;
  email: string;
  name: string;
  avatar: string;
  profileCoverImage: string;
  profileTitle: string;
  profileBio: string;
  profileDetails: string;
  profilePhone: string;
  profileLocation: string;
  profileTimezone: string;
  profileWebsite: string;
  profileSocialLinks: Record<SocialLinkKey, string>;
  updatedAt: string;
}

function formatLastUpdated(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProfileClient({ initialProfile }: { initialProfile: ProfileFormData }) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileFormData>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300";
  const textareaClass = `${inputClass} resize-y min-h-[120px]`;

  const initials = useMemo(() => {
    const source = (form.name || form.email || "?").trim();
    return source.charAt(0).toUpperCase();
  }, [form.name, form.email]);

  const lastUpdatedLabel = useMemo(() => formatLastUpdated(form.updatedAt), [form.updatedAt]);

  const setField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSocial = (key: SocialLinkKey, value: string) => {
    setForm((prev) => ({
      ...prev,
      profileSocialLinks: {
        ...prev.profileSocialLinks,
        [key]: value,
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save profile");
      setSaving(false);
      return;
    }

    const data = await res.json();
    setForm(data.user as ProfileFormData);
    setSaving(false);
    setSuccess("Profile updated.");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            My Profile
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Manage your admin profile information, photo, and public-facing details.
          </p>
          {lastUpdatedLabel ? (
            <p className="text-[11px] text-slate-400 mt-1">Last updated: {lastUpdatedLabel}</p>
          ) : null}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-60 transition-colors shadow-sm"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">{success}</div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[340px,1fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              {form.avatar ? (
                <img src={form.avatar} alt={form.name || form.email} className="w-14 h-14 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#0F172A] flex items-center justify-center text-[18px] font-bold text-white">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-[14px] font-semibold text-slate-900">{form.name || "Unnamed admin"}</p>
                <p className="text-[12px] text-slate-500">{form.email}</p>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Profile Photo
              </label>
              <ImageUpload value={form.avatar} onChange={(url) => setField("avatar", url)} compact />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[13px] font-semibold text-slate-700 mb-4">Contact Snapshot</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
                <input value={form.email} readOnly className={`${inputClass} bg-slate-50 text-slate-500`} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Phone</label>
                <input
                  value={form.profilePhone}
                  onChange={(event) => setField("profilePhone", event.target.value)}
                  className={inputClass}
                  placeholder="+1 ..."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Timezone</label>
                <input
                  value={form.profileTimezone}
                  onChange={(event) => setField("profileTimezone", event.target.value)}
                  className={inputClass}
                  placeholder="UTC+03:00"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[13px] font-semibold text-slate-700 mb-3">Cover Image</h2>
            <ImageUpload
              value={form.profileCoverImage}
              onChange={(url) => setField("profileCoverImage", url)}
              aspectRatio="16/6"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[13px] font-semibold text-slate-700 mb-4">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  className={inputClass}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Title</label>
                <input
                  value={form.profileTitle}
                  onChange={(event) => setField("profileTitle", event.target.value)}
                  className={inputClass}
                  placeholder="Editor in Chief"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Location</label>
                <input
                  value={form.profileLocation}
                  onChange={(event) => setField("profileLocation", event.target.value)}
                  className={inputClass}
                  placeholder="Istanbul, TR"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Website</label>
                <input
                  value={form.profileWebsite}
                  onChange={(event) => setField("profileWebsite", event.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[13px] font-semibold text-slate-700 mb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Personal Site</label>
                <input
                  value={form.profileSocialLinks.website}
                  onChange={(event) => setSocial("website", event.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Twitter / X</label>
                <input
                  value={form.profileSocialLinks.twitter}
                  onChange={(event) => setSocial("twitter", event.target.value)}
                  className={inputClass}
                  placeholder="https://x.com/..."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Instagram</label>
                <input
                  value={form.profileSocialLinks.instagram}
                  onChange={(event) => setSocial("instagram", event.target.value)}
                  className={inputClass}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">LinkedIn</label>
                <input
                  value={form.profileSocialLinks.linkedin}
                  onChange={(event) => setSocial("linkedin", event.target.value)}
                  className={inputClass}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">YouTube</label>
                <input
                  value={form.profileSocialLinks.youtube}
                  onChange={(event) => setSocial("youtube", event.target.value)}
                  className={inputClass}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">GitHub</label>
                <input
                  value={form.profileSocialLinks.github}
                  onChange={(event) => setSocial("github", event.target.value)}
                  className={inputClass}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[13px] font-semibold text-slate-700 mb-4">Biography & Detailed Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Short Bio</label>
                <textarea
                  value={form.profileBio}
                  onChange={(event) => setField("profileBio", event.target.value)}
                  className={textareaClass}
                  placeholder="A concise bio shown in profile cards."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Detailed Profile</label>
                <textarea
                  value={form.profileDetails}
                  onChange={(event) => setField("profileDetails", event.target.value)}
                  className={`${textareaClass} min-h-[220px]`}
                  placeholder="Write detailed background, expertise, responsibilities, or any extra profile notes."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
