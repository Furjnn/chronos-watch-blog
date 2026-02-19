import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecoveryCodesPanel from "@/components/admin/RecoveryCodesPanel";
import { getAdminRecoveryCodeInfo } from "@/lib/admin-recovery";

function formatDate(value: Date | null) {
  if (!value) return "-";
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SecurityPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin");
  }

  const [events, lockedUsers, lockedMembers, usersWith2FA, recoveryInfo] = await Promise.all([
    prisma.securityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 250,
      include: {
        user: { select: { id: true, email: true, name: true } },
        member: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: { lockedUntil: { gt: new Date() } },
      select: { id: true, name: true, email: true, lockedUntil: true, failedLoginAttempts: true },
      orderBy: { lockedUntil: "desc" },
    }),
    prisma.member.findMany({
      where: { lockedUntil: { gt: new Date() } },
      select: { id: true, name: true, email: true, lockedUntil: true, failedLoginAttempts: true },
      orderBy: { lockedUntil: "desc" },
    }),
    prisma.user.count({
      where: { twoFactorEnabled: true },
    }),
    getAdminRecoveryCodeInfo(session.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
          Security
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Monitor login behavior, lockouts, and MFA adoption.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.8px] text-slate-400">2FA Enabled Admins</p>
          <p className="mt-1 text-[26px] font-semibold text-slate-900">{usersWith2FA}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.8px] text-slate-400">Locked Admin Accounts</p>
          <p className="mt-1 text-[26px] font-semibold text-slate-900">{lockedUsers.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.8px] text-slate-400">Locked Member Accounts</p>
          <p className="mt-1 text-[26px] font-semibold text-slate-900">{lockedMembers.length}</p>
        </div>
      </div>

      <RecoveryCodesPanel
        enabled={recoveryInfo.enabled}
        initialRecoveryCodeCount={recoveryInfo.recoveryCodeCount}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 text-[13px] font-semibold text-slate-700">
            Locked Admin Accounts
          </div>
          <div className="divide-y divide-slate-100">
            {lockedUsers.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-slate-400 text-center">No locked admin accounts.</div>
            ) : (
              lockedUsers.map((user) => (
                <div key={user.id} className="px-5 py-3.5">
                  <div className="text-[13px] font-semibold text-slate-700">{user.name}</div>
                  <div className="text-[12px] text-slate-500">{user.email}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Locked until {formatDate(user.lockedUntil)} ({user.failedLoginAttempts} failed attempts)
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 text-[13px] font-semibold text-slate-700">
            Locked Member Accounts
          </div>
          <div className="divide-y divide-slate-100">
            {lockedMembers.length === 0 ? (
              <div className="px-5 py-8 text-[13px] text-slate-400 text-center">No locked member accounts.</div>
            ) : (
              lockedMembers.map((member) => (
                <div key={member.id} className="px-5 py-3.5">
                  <div className="text-[13px] font-semibold text-slate-700">{member.name}</div>
                  <div className="text-[12px] text-slate-500">{member.email}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Locked until {formatDate(member.lockedUntil)} ({member.failedLoginAttempts} failed attempts)
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 text-[13px] font-semibold text-slate-700">
          Security Events
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Time</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actor</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Message</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-slate-400">
                    No security events yet.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const actor = event.user
                    ? `${event.user.name} (${event.user.email})`
                    : event.member
                      ? `${event.member.name} (${event.member.email})`
                      : "Unknown";
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 text-[12px] text-slate-500">{formatDate(event.createdAt)}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">{event.type}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">{actor}</td>
                      <td className="px-4 py-3 text-[12px]">
                        <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${event.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {event.success ? "Success" : "Failure"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-500">{event.message || "-"}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-400">{event.ipAddress || "-"}</td>
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
