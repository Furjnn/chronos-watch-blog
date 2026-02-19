"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | "SPAM";

interface CommentRow {
  id: string;
  body: string;
  status: CommentStatus;
  authorName: string | null;
  authorEmail: string | null;
  moderationNote: string | null;
  moderatedAt: string | null;
  createdAt: string;
  post: { id: string; title: string; slug: string } | null;
  review: { id: string; title: string; slug: string } | null;
  member: { id: string; name: string; email: string } | null;
  moderatedBy: { id: string; name: string; email: string } | null;
}

const STATUS_OPTIONS: CommentStatus[] = ["PENDING", "APPROVED", "REJECTED", "SPAM"];

const STATUS_STYLES: Record<CommentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  SPAM: "bg-slate-100 text-slate-600",
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentsClient({ comments }: { comments: CommentRow[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<CommentStatus | "ALL">("PENDING");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteByCommentId, setNoteByCommentId] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return comments;
    return comments.filter((comment) => comment.status === statusFilter);
  }, [comments, statusFilter]);

  const counts = useMemo(() => {
    return {
      ALL: comments.length,
      PENDING: comments.filter((comment) => comment.status === "PENDING").length,
      APPROVED: comments.filter((comment) => comment.status === "APPROVED").length,
      REJECTED: comments.filter((comment) => comment.status === "REJECTED").length,
      SPAM: comments.filter((comment) => comment.status === "SPAM").length,
    };
  }, [comments]);

  const moderate = async (id: string, action: "approve" | "reject" | "spam") => {
    setActiveId(id);
    const note = noteByCommentId[id] || "";

    const response = await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data.error || "Unable to moderate comment");
      setActiveId(null);
      return;
    }

    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Comments
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Moderate community comments before they go live.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {(["ALL", ...STATUS_OPTIONS] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border-none cursor-pointer transition-colors ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-[13px] text-slate-500">
            No comments in this state.
          </div>
        ) : (
          filtered.map((comment) => {
            const authorName = comment.member?.name || comment.authorName || "Anonymous";
            const authorEmail = comment.member?.email || comment.authorEmail || "-";
            const target = comment.post
              ? {
                  label: `Post: ${comment.post.title}`,
                  href: `/blog/${comment.post.slug}`,
                }
              : comment.review
                ? {
                    label: `Review: ${comment.review.title}`,
                    href: `/reviews/${comment.review.slug}`,
                  }
                : null;
            const note = noteByCommentId[comment.id] || "";

            return (
              <div key={comment.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="text-[13px]">
                    <span className="font-semibold text-slate-800">{authorName}</span>
                    <span className="text-slate-400 ml-2">{authorEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[comment.status]}`}>
                      {comment.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap">{comment.body}</p>

                {target && (
                  <div className="mt-3 text-[12px] text-slate-500">
                    <span>Context: </span>
                    <Link
                      href={target.href}
                      target="_blank"
                      className="text-[#B8956A] no-underline hover:underline"
                    >
                      {target.label}
                    </Link>
                  </div>
                )}

                {(comment.moderationNote || comment.moderatedBy || comment.moderatedAt) && (
                  <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
                    {comment.moderationNote && (
                      <div>
                        <span className="font-semibold text-slate-700">Note:</span> {comment.moderationNote}
                      </div>
                    )}
                    {comment.moderatedBy && (
                      <div>
                        <span className="font-semibold text-slate-700">Moderator:</span> {comment.moderatedBy.name}
                      </div>
                    )}
                    {comment.moderatedAt && (
                      <div>
                        <span className="font-semibold text-slate-700">Moderated:</span> {formatDate(comment.moderatedAt)}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <textarea
                    value={note}
                    onChange={(event) =>
                      setNoteByCommentId((prev) => ({ ...prev, [comment.id]: event.target.value }))
                    }
                    rows={2}
                    placeholder="Optional moderator note"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-[#B8956A]"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => moderate(comment.id, "approve")}
                      disabled={activeId === comment.id}
                      className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 text-[12px] font-semibold cursor-pointer disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => moderate(comment.id, "reject")}
                      disabled={activeId === comment.id}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-[12px] font-semibold cursor-pointer disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => moderate(comment.id, "spam")}
                      disabled={activeId === comment.id}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-700 text-[12px] font-semibold cursor-pointer disabled:opacity-60"
                    >
                      Mark as Spam
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
