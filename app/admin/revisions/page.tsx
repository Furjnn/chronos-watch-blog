import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date) {
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type RevisionItem = {
  id: string;
  kind: "post" | "review";
  entityId: string;
  title: string;
  version: number;
  reason: string | null;
  createdAt: Date;
  actorName: string;
};

export default async function RevisionsPage() {
  const [postRevisions, reviewRevisions] = await Promise.all([
    prisma.postRevision.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      select: {
        id: true,
        version: true,
        reason: true,
        createdAt: true,
        postId: true,
        post: { select: { title: true } },
        createdByUser: { select: { name: true } },
        createdByMember: { select: { name: true } },
      },
    }),
    prisma.reviewRevision.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      select: {
        id: true,
        version: true,
        reason: true,
        createdAt: true,
        reviewId: true,
        review: { select: { title: true } },
        createdByUser: { select: { name: true } },
        createdByMember: { select: { name: true } },
      },
    }),
  ]);

  const items: RevisionItem[] = [
    ...postRevisions.map((revision) => ({
      id: revision.id,
      kind: "post" as const,
      entityId: revision.postId,
      title: revision.post.title,
      version: revision.version,
      reason: revision.reason,
      createdAt: revision.createdAt,
      actorName: revision.createdByUser?.name || revision.createdByMember?.name || "System",
    })),
    ...reviewRevisions.map((revision) => ({
      id: revision.id,
      kind: "review" as const,
      entityId: revision.reviewId,
      title: revision.review.title,
      version: revision.version,
      reason: revision.reason,
      createdAt: revision.createdAt,
      actorName: revision.createdByUser?.name || revision.createdByMember?.name || "System",
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
          Revision History
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Snapshot history for posts and reviews.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Time</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Type</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Title</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Version</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Actor</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Reason</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-slate-400">
                    No revisions yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 text-[12px] text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-slate-700 uppercase">{item.kind}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">{item.title}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">v{item.version}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-600">{item.actorName}</td>
                    <td className="px-4 py-3 text-[12px] text-slate-500">{item.reason || "-"}</td>
                    <td className="px-4 py-3 text-[12px]">
                      <Link
                        href={item.kind === "post" ? `/admin/posts/${item.entityId}/edit` : `/admin/reviews/${item.entityId}/edit`}
                        className="text-[#B8956A] no-underline hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
