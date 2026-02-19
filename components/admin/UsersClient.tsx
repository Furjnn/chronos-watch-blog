"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "EDITOR" | "AUTHOR";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLE_OPTIONS: Role[] = ["ADMIN", "EDITOR", "AUTHOR"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UsersClient({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR" as Role,
    twoFactorEnabled: false,
  });
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "EDITOR" as Role,
    password: "",
    twoFactorEnabled: false,
  });

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-800 outline-none focus:border-[#B8956A] focus:ring-2 focus:ring-[#B8956A]/10 transition-all placeholder:text-slate-300";

  const resetNew = () =>
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "EDITOR",
      twoFactorEnabled: false,
    });

  const startEdit = (user: UserRow) => {
    setEditingId(user.id);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      twoFactorEnabled: user.twoFactorEnabled,
    });
  };

  const createUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) return;
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to create user");
      setCreating(false);
      return;
    }
    setCreating(false);
    resetNew();
    setShowAdd(false);
    router.refresh();
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    const payload = {
      name: editUser.name,
      email: editUser.email,
      role: editUser.role,
      twoFactorEnabled: editUser.twoFactorEnabled,
      password: editUser.password.trim() || undefined,
    };
    const res = await fetch(`/api/admin/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to update user");
      setSavingEdit(false);
      return;
    }
    setSavingEdit(false);
    setEditingId(null);
    router.refresh();
  };

  const remove = async (user: UserRow) => {
    if (!confirm(`Delete "${user.name}"?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete user");
      return;
    }
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>Users</h1>
          <p className="text-[13px] text-slate-400 mt-1">{users.length} admin accounts</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] transition-colors shadow-sm">
          {showAdd ? "Cancel" : "Add User"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h3 className="text-[14px] font-semibold text-slate-700">New User</h3></div>
          <div className="p-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
              <input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Email</label>
              <input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Password</label>
              <input type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Role</label>
              <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as Role }))} className={inputClass}>
                {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-[13px] text-slate-600">
                <input
                  type="checkbox"
                  checked={newUser.twoFactorEnabled}
                  onChange={(e) => setNewUser((p) => ({ ...p, twoFactorEnabled: e.target.checked }))}
                />
                Enable email-based 2FA
              </label>
            </div>
            <div className="md:col-span-2">
              <button disabled={creating} onClick={createUser} className="px-6 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-60">
                {creating ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5">User</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-28">Role</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-24">2FA</th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 w-36">Created</th>
              <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3.5 w-44">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4">
                  <div className="text-[14px] font-medium text-slate-800 flex items-center gap-2">
                    {user.name}
                    {user.id === currentUserId && <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">You</span>}
                  </div>
                  <div className="text-[12px] text-slate-500">{user.email}</div>
                </td>
                <td className="px-4 py-4 text-[12px] text-slate-600 font-semibold">{user.role}</td>
                <td className="px-4 py-4 text-[12px]">
                  <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${user.twoFactorEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {user.twoFactorEnabled ? "Enabled" : "Off"}
                  </span>
                </td>
                <td className="px-4 py-4 text-[12px] text-slate-500">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => startEdit(user)} className="px-3 py-1.5 rounded border border-slate-200 bg-white text-[12px] cursor-pointer hover:bg-slate-50">Edit</button>
                    <button onClick={() => remove(user)} disabled={user.id === currentUserId} className="px-3 py-1.5 rounded border border-red-200 bg-red-50 text-red-600 text-[12px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {editingId && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/30 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-slate-700">Edit User</h3>
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">Close</button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                <input value={editUser.name} onChange={(e) => setEditUser((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Email</label>
                <input type="email" value={editUser.email} onChange={(e) => setEditUser((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Role</label>
                <select value={editUser.role} onChange={(e) => setEditUser((p) => ({ ...p, role: e.target.value as Role }))} className={inputClass}>
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">New Password (optional)</label>
                <input type="password" value={editUser.password} onChange={(e) => setEditUser((p) => ({ ...p, password: e.target.value }))} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-[13px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={editUser.twoFactorEnabled}
                    onChange={(e) => setEditUser((p) => ({ ...p, twoFactorEnabled: e.target.checked }))}
                  />
                  Enable email-based 2FA
                </label>
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
