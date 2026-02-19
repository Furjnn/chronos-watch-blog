"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to process request");
        setLoading(false);
        return;
      }
      setMessage(
        data.message ||
          "If an account exists for this email, a password reset link has been sent.",
      );
      setLoading(false);
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
            Reset Admin Password
          </h1>
          <p className="text-slate-400 text-[13px] mt-2">Enter your admin email to receive a reset link.</p>
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

          <div className="mb-5">
            <label className="text-[12px] font-medium text-slate-400 block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@chronos.blog"
              className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[14px] outline-none placeholder:text-slate-600 focus:border-[#B8956A] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#B8956A] rounded-lg text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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
