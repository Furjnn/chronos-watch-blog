"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { useI18n } from "@/components/i18n/I18nProvider";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="h-[380px] animate-pulse rounded-xl bg-slate-50" />,
});

export default function MemberPostComposer() {
  const { t, localizePath } = useI18n();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<JSONContent | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/member/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("submit.submitFailed", "Unable to submit post"));
        setLoading(false);
        return;
      }

      setTitle("");
      setExcerpt("");
      setContent(null);
      setSuccess(true);
    } catch {
      setError(t("submit.submitFailed", "Unable to submit post"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitPost} className="space-y-4">
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">{error}</div>}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
          {t("submit.success", "Post submitted. It will be reviewed by admin/editor before publishing.")}
          <Link href={localizePath("/account")} className="ml-1 font-semibold text-emerald-800">
            {t("submit.viewSubmissions", "View my submissions")}
          </Link>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-light)]">{t("submit.titleLabel", "Title")}</label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={8}
          required
          className="w-full rounded-lg border border-[var(--border)] px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--gold)]"
          placeholder={t("submit.titlePlaceholder", "Write a descriptive title")}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-light)]">{t("submit.excerptLabel", "Excerpt")}</label>
        <textarea
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-[var(--border)] px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--gold)]"
          placeholder={t("submit.excerptPlaceholder", "Optional short summary")}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-light)]">{t("submit.contentLabel", "Content")}</label>
        <TiptapEditor
          content={content}
          onChange={setContent}
          uploadEndpoint="/api/member/upload"
          labels={{
            placeholder: t("submit.editor.placeholder", "Start writing your article..."),
            linkPrompt: t("submit.editor.linkPrompt", "Link URL:"),
            imageUploadFailed: t("submit.editor.imageUploadFailed", "Image upload failed"),
            toolbar: {
              bold: t("submit.editor.bold", "Bold"),
              italic: t("submit.editor.italic", "Italic"),
              strikethrough: t("submit.editor.strikethrough", "Strikethrough"),
              heading2: t("submit.editor.heading2", "Heading 2"),
              heading3: t("submit.editor.heading3", "Heading 3"),
              bulletList: t("submit.editor.bulletList", "Bullet List"),
              orderedList: t("submit.editor.orderedList", "Ordered List"),
              blockquote: t("submit.editor.blockquote", "Blockquote"),
              uploadImage: t("submit.editor.uploadImage", "Upload Image"),
              link: t("submit.editor.link", "Link"),
              horizontalRule: t("submit.editor.horizontalRule", "Horizontal Rule"),
              codeBlock: t("submit.editor.codeBlock", "Code Block"),
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--charcoal)] px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.8px] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t("submit.submitting", "Submitting...") : t("submit.submitForReview", "Submit For Review")}
      </button>
    </form>
  );
}
