"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MemberStatus = "ACTIVE" | "BANNED" | "TIMEOUT";

interface MemberRow {
  id: string;
  name: string;
  email: string;
  status: MemberStatus;
  timeoutUntil: string | null;
  moderationReason: string | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
  };
}

const statusStyles: Record<MemberStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BANNED: "bg-rose-50 text-rose-700 border-rose-200",
  TIMEOUT: "bg-amber-50 text-amber-700 border-amber-200",
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MembersClient({ members }: { members: MemberRow[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"ALL" | MemberStatus>("ALL");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const filtered = useMemo(() => members.filter((member) => {
    if (statusFilter !== "ALL" && member.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
  }), [members, search, statusFilter]);

  const counts = useMemo(() => ({
    ALL: members.length,
    ACTIVE: members.filter((m) => m.status === "ACTIVE").length,
    TIMEOUT: members.filter((m) => m.status === "TIMEOUT").length,
    BANNED: members.filter((m) => m.status === "BANNED").length,
  }), [members]);

  const openEdit = (member: MemberRow) => {
    setEditingId(member.id);
    setEditForm({ name: member.name, email: member.email });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/members/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update member");
        setSavingEdit(false);
        return;
      }

      setSavingEdit(false);
      setEditingId(null);
      router.refresh();
    } catch {
      alert("Failed to update member");
      setSavingEdit(false);
    }
  };

  const moderate = async (member: MemberRow, action: "ban" | "timeout" | "activate") => {
    let reason = "";
    let timeoutHours: number | undefined;

    if (action === "timeout") {
      const rawHours = prompt("Timeout duration in hours (1 - 720):", "24");
      if (rawHours === null) return;
      const parsed = Number(rawHours);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 720) {
        alert("Enter a number between 1 and 720.");
        return;
      }
      timeoutHours = parsed;
      const note = prompt("Timeout reason (optional):", member.moderationReason || "");
      if (note === null) return;
      reason = note;
    } else if (action === "ban") {
      const note = prompt("Ban reason (optional):", member.moderationReason || "");
      if (note === null) return;
      reason = note;
    } else {
      const note = prompt("Re-activation note (optional):", "");
      if (note === null) return;
      reason = note;
    }

    setBusyId(member.id);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason, timeoutHours }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update member status");
        setBusyId(null);
        return;
      }
      router.refresh();
    } catch {
      alert("Failed to update member status");
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Members</h1>
          <p className="text-[13px] text-slate-400 mt-1">Manage community member accounts</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5">
          {(["ALL", "ACTIVE", "TIMEOUT", "BANNED"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`text-[12px] font-medium px-3.5 py-2 rounded-lg border-none cursor-pointer transition-all flex items-center gap-2 ${
                statusFilter === key ? "bg-slate-900 text-white shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {key}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === key ? "bg-white/20" : "bg-slate-100"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl w-72">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="border-none outline-none bg-transparent text-[13px] text-slate-700 flex-1 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-sm">
              x
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">Member</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-24">Posts</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Status</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-32">Timeout Until</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Reason</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5 w-80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <p className="text-[14px] text-slate-500 font-medium">No members found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-medium text-slate-800">{member.name}</div>
                      <div className="text-[12px] text-slate-500">{member.email}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Joined {formatDate(member.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-600">{member._count.posts}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[member.status]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-slate-500">{formatDate(member.timeoutUntil)}</td>
                    <td className="px-4 py-4 text-[12px] text-slate-500 max-w-[240px]">
                      <span className="line-clamp-2">{member.moderationReason || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => openEdit(member)}
                          className="px-3 py-1.5 rounded border border-slate-200 bg-white text-[12px] cursor-pointer hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => moderate(member, "activate")}
                          disabled={busyId === member.id || member.status === "ACTIVE"}
                          className="px-3 py-1.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 text-[12px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => moderate(member, "timeout")}
                          disabled={busyId === member.id}
                          className="px-3 py-1.5 rounded border border-amber-200 bg-amber-50 text-amber-700 text-[12px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Timeout
                        </button>
                        <button
                          onClick={() => moderate(member, "ban")}
                          disabled={busyId === member.id || member.status === "BANNED"}
                          className="px-3 py-1.5 rounded border border-rose-200 bg-rose-50 text-rose-700 text-[12px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingId && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/30 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-slate-700">Edit Member</h3>
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">Close</button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded border border-slate-200 bg-white text-[12px] cursor-pointer">Cancel</button>
              <button onClick={saveEdit} disabled={savingEdit} className="px-4 py-2 rounded bg-[#B8956A] text-white text-[12px] border-none cursor-pointer disabled:opacity-60">
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
