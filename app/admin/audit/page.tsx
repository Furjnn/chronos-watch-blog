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

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    include: {
      actorUser: { select: { id: true, name: true, email: true } },
      actorMember: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
          Audit Log
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Immutable timeline of administrative and moderation actions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Time</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Action</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Entity</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Actor</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Summary</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-10 text-[13px] text-slate-400">
                    No audit logs yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actorLabel = log.actorUser
                    ? `${log.actorUser.name} (${log.actorUser.email})`
                    : log.actorMember
                      ? `${log.actorMember.name} (${log.actorMember.email})`
                      : "System";
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 text-[12px] text-slate-500">{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">{log.action}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500">{log.entityType}:{log.entityId || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500">{actorLabel}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500">{log.summary || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">{log.ipAddress || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
