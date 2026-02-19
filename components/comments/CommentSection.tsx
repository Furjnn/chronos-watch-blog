"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

type CommentItem = {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
};

type MemberSession = {
  id: string;
  name: string;
  email: string;
} | null;

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommentSection({
  postId,
  reviewId,
}: {
  postId?: string;
  reviewId?: string;
}) {
  const { locale } = useI18n();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberSession, setMemberSession] = useState<MemberSession>(null);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (postId) params.set("postId", postId);
    if (reviewId) params.set("reviewId", reviewId);
    return params.toString();
  }, [postId, reviewId]);

  useEffect(() => {
    if (!queryString) return;
    let active = true;

    const run = async () => {
      const res = await fetch(`/api/comments?${queryString}`);
      if (!active) return;

      if (!res.ok) {
        setComments([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!active) return;
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setLoading(false);
    };

    void run();
    return () => {
      active = false;
    };
  }, [queryString]);

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/member/session", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (data?.user) {
        setMemberSession(data.user);
      }
    };
    void loadSession();
  }, []);

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const payload: Record<string, unknown> = {
      body,
      postId: postId || null,
      reviewId: reviewId || null,
    };
    if (!memberSession) {
      payload.name = name;
      payload.email = email;
    }

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to submit comment");
      setSubmitting(false);
      return;
    }

    setBody("");
    if (!memberSession) {
      setName("");
      setEmail("");
    }
    setMessage("Your comment has been submitted for moderation.");
    setSubmitting(false);
  };

  return (
    <section className="mt-12 border-t border-[var(--border)] pt-10">
      <h2 className="text-[26px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
        Comments
      </h2>
      <p className="mt-1 text-[13px] text-[var(--text-light)]">
        Comments are published after moderation.
      </p>

      <form onSubmit={submitComment} className="mt-5 space-y-3 rounded-xl border border-[var(--border)] bg-white p-4">
        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
            {message}
          </div>
        )}

        {!memberSession && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={locale === "tr" ? "Adınız" : "Your name"}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-[13px] outline-none focus:border-[var(--gold)]"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={locale === "tr" ? "E-posta" : "Email"}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-[13px] outline-none focus:border-[var(--gold)]"
              required
            />
          </div>
        )}

        {memberSession && (
          <div className="text-[12px] text-[var(--text-light)]">
            Commenting as <span className="font-semibold text-[var(--charcoal)]">{memberSession.name}</span>
          </div>
        )}

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          minLength={3}
          maxLength={2000}
          required
          placeholder={locale === "tr" ? "Yorumunuzu yazın..." : "Write your comment..."}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-[13px] outline-none focus:border-[var(--gold)]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--charcoal)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.8px] text-white border-none cursor-pointer disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Comment"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-[13px] text-[var(--text-light)]">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-[13px] text-[var(--text-light)]">
            No published comments yet.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-[var(--border)] bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-light)]">
                <span className="font-semibold text-[var(--charcoal)]">{comment.authorName}</span>
                <span>•</span>
                <span>{formatDate(comment.createdAt, locale)}</span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">{comment.body}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
