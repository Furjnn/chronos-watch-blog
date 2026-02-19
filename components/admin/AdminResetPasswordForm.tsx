"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing or invalid.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to reset password");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Password updated. Redirecting to login...");
      setLoading(false);
      setTimeout(() => {
        router.push("/admin/login");
        router.refresh();
      }, 1200);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-6">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            Set New Password
          </h1>
          <p className="text-slate-400 text-[13px] mt-2">Choose a strong password for your admin account.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[13px] px-4 py-2.5 rounded-lg mb-4">
              {message}
            </div>
          )}

          <div className="mb-4">
            <label className="text-[12px] font-medium text-slate-400 block mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[14px] outline-none placeholder:text-slate-600 focus:border-[#B8956A] transition-colors"
              required
              minLength={8}
            />
          </div>

          <div className="mb-5">
            <label className="text-[12px] font-medium text-slate-400 block mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat password"
              className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[14px] outline-none placeholder:text-slate-600 focus:border-[#B8956A] transition-colors"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#B8956A] rounded-lg text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-[12px] mt-5">
          <Link href="/admin/login" className="text-slate-300 no-underline hover:text-white transition-colors">
            Back to admin sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
