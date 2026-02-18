"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface FileInfo {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MediaClient({ files }: { files: FileInfo[] }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Media Library</h1>
          <p className="text-[13px] text-slate-400 mt-1">{files.length} file{files.length !== 1 ? "s" : ""} uploaded</p>
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFiles} className="hidden" />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed transition-all cursor-pointer mb-8 ${
          dragOver ? "border-[#B8956A] bg-[#B8956A]/5" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
        }`}
      >
        <div className="py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            {uploading ? (
              <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8956A" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            )}
          </div>
          <p className="text-[14px] text-slate-600 font-medium mb-0.5">
            {uploading ? "Uploading..." : dragOver ? "Drop image here" : "Click or drag images to upload"}
          </p>
          <p className="text-[12px] text-slate-400">JPG, PNG, WebP, GIF · Max 10MB</p>
        </div>
      </div>

      {/* Files grid */}
      {files.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
          </div>
          <h3 className="text-[18px] font-semibold text-slate-700 mb-2">No media uploaded yet</h3>
          <p className="text-[14px] text-slate-400 max-w-md mx-auto">Upload images to use in your posts, reviews, and brand pages. You can also upload directly from the content editors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map(file => (
            <div key={file.filename} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
              <div className="relative" style={{ aspectRatio: "1" }}>
                <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => copyUrl(file.url)}
                    className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-slate-700 border-none cursor-pointer hover:bg-white shadow-sm transition-colors">
                    {copied === file.url ? "✓ Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-[12px] text-slate-700 font-medium truncate">{file.filename}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-slate-400">{formatSize(file.size)}</span>
                  <span className="text-[11px] text-slate-400">{formatDate(file.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
