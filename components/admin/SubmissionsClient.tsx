"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Submission = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
  submittedByMember: {
    id: string;
    name: string;
    email: string;
  } | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const badgeStyles: Record<Submission["approvalStatus"], string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function SubmissionsClient({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<Submission["approvalStatus"] | "ALL">("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeStatus === "ALL") return submissions;
    return submissions.filter((item) => item.approvalStatus === activeStatus);
  }, [activeStatus, submissions]);

  const counts = useMemo(() => ({
    ALL: submissions.length,
    PENDING: submissions.filter((s) => s.approvalStatus === "PENDING").length,
    APPROVED: submissions.filter((s) => s.approvalStatus === "APPROVED").length,
    REJECTED: submissions.filter((s) => s.approvalStatus === "REJECTED").length,
  }), [submissions]);

  const moderate = async (submission: Submission, action: "approve" | "reject") => {
    const note = prompt(
      action === "approve"
        ? "Optional approval note:"
        : "Optional rejection reason (recommended):",
      submission.reviewNote || "",
    );
    if (note === null) return;

    setBusyId(submission.id);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewNote: note }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update submission");
        setBusyId(null);
        return;
      }
      router.refresh();
    } catch {
      alert("Failed to update submission");
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Member Submissions
          </h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Review, approve, or reject posts submitted by registered users.
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`flex items-center gap-2 rounded-lg border-none px-3.5 py-2 text-[12px] font-medium transition-all ${
              activeStatus === status
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {status}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeStatus === status ? "bg-white/20" : "bg-slate-100"}`}>
              {counts[status]}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submission</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Member</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Submitted</th>
              <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <p className="text-[14px] font-medium text-slate-600">No submissions in this status.</p>
                </td>
              </tr>
            ) : (
              filtered.map((submission) => (
                <tr key={submission.id} className="group hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="max-w-[380px]">
                      <div className="text-[14px] font-medium text-slate-800">{submission.title}</div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                        {submission.excerpt || "No excerpt provided."}
                      </p>
                      {submission.approvalStatus === "APPROVED" && (
                        <Link
                          href={`/blog/${submission.slug}`}
                          target="_blank"
                          className="mt-2 inline-block text-[12px] font-medium text-[#B8956A] no-underline"
                        >
                          View published post
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-600">
                    <div>{submission.submittedByMember?.name || "Unknown"}</div>
                    <div className="text-[12px] text-slate-400">{submission.submittedByMember?.email || "-"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeStyles[submission.approvalStatus]}`}>
                      {submission.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500">{formatDate(submission.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    {submission.approvalStatus === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => moderate(submission, "reject")}
                          disabled={busyId === submission.id}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => moderate(submission, "approve")}
                          disabled={busyId === submission.id}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-[12px] text-slate-400">{formatDate(submission.reviewedAt)}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
