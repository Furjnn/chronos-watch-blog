"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useCallback } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: string; // e.g. "16/9", "1/1", "4/3"
  compact?: boolean;
}

export default function ImageUpload({ value, onChange, aspectRatio = "16/9", compact = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError("");
    setUploading(true);
    setProgress(10);

    // Validate client-side
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type");
      setUploading(false);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      setUploading(false);
      return;
    }

    setProgress(30);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      setProgress(80);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      const data = await res.json();
      setProgress(100);
      onChange(data.url);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch {
      setError("Upload failed");
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  if (compact) {
    return (
      <div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        <div className="flex items-center gap-3">
          {value ? (
            <div className="relative group">
              <img src={value} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
              <button onClick={() => onChange("")}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">×</button>
            </div>
          ) : null}
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors disabled:opacity-50">
            {uploading ? "Uploading..." : value ? "Change" : "Upload"}
          </button>
        </div>
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {value ? (
        /* Has image - show preview */
        <div className="relative group rounded-xl overflow-hidden border border-slate-200">
          <img src={value} alt="" className="w-full object-cover" style={{ aspectRatio }} />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-[12px] font-semibold text-slate-700 border-none cursor-pointer hover:bg-white transition-colors shadow-sm">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Replace
              </span>
            </button>
            <button onClick={() => onChange("")}
              className="px-4 py-2 bg-red-500/90 backdrop-blur-sm rounded-lg text-[12px] font-semibold text-white border-none cursor-pointer hover:bg-red-500 transition-colors shadow-sm">
              Remove
            </button>
          </div>

          {/* File info */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-[11px] text-white/80 truncate">{value.split("/").pop()}</p>
          </div>
        </div>
      ) : (
        /* No image - show upload area */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            dragOver
              ? "border-[#B8956A] bg-[#B8956A]/5"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
          style={{ aspectRatio }}
        >
          <div className="flex flex-col items-center justify-center h-full p-6">
            {uploading ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-[#B8956A]/10 flex items-center justify-center mb-3">
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8956A" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                </div>
                <p className="text-[13px] text-slate-600 font-medium mb-2">Uploading...</p>
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B8956A] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
                <p className="text-[13px] text-slate-600 font-medium mb-0.5">
                  {dragOver ? "Drop image here" : "Click or drag to upload"}
                </p>
                <p className="text-[11px] text-slate-400">JPG, PNG, WebP · Max 10MB</p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-[12px] text-red-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}

      {/* URL fallback */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">or paste URL</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full mt-2 px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:border-[#B8956A] transition-colors placeholder:text-slate-300"
      />
    </div>
  );
}
