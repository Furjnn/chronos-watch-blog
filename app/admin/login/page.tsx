"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorInfo, setTwoFactorInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = requiresTwoFactor
        ? useRecoveryCode
          ? { email, recoveryCode }
          : { email, verificationCode }
        : { email, password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setUseRecoveryCode(false);
        setRecoveryCode("");
        if (data.developmentCode) {
          setTwoFactorInfo(`Email is not configured. Development verification code: ${data.developmentCode}`);
        } else {
          setTwoFactorInfo("Verification code sent to your email. You can also use a recovery code.");
        }
        setLoading(false);
        return;
      }

      const nextPath = searchParams.get("next") || "/admin";
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="w-full max-w-[400px] px-6">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#B8956A] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">C</span>
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            CHRONOS
          </h1>
          <p className="text-slate-500 text-[13px] mt-1">Content Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7">
          <h2 className="text-white text-[18px] font-semibold mb-1">Welcome back</h2>
          <p className="text-slate-400 text-[13px] mb-6">
            {requiresTwoFactor ? "Complete second-factor verification" : "Sign in to manage your content"}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          {twoFactorInfo && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[13px] px-4 py-2.5 rounded-lg mb-4">
              {twoFactorInfo}
            </div>
          )}

          <div className="mb-4">
            <label className="text-[12px] font-medium text-slate-400 block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chronos.blog"
              className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[14px] outline-none placeholder:text-slate-600 focus:border-[#B8956A] transition-colors"
              required
              disabled={requiresTwoFactor}
            />
          </div>

          {requiresTwoFactor ? (
            <div className="mb-6">
              <label className="text-[12px] font-medium text-slate-400 block mb-1.5">
                {useRecoveryCode ? "Recovery Code" : "Verification Code"}
              </label>
              {useRecoveryCode ? (
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(event) => setRecoveryCode(event.target.value.toUpperCase())}
                  placeholder="XXXXX-XXXXX"
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[14px] outline-none placeholder:text-slate-600 focus:border-[#B8956A] transition-colors uppercase"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value.replace(/\D+/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[14px] outline-none placeholder:text-slate-600 focus:border-[#B8956A] transition-colors"
                  required
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setRequiresTwoFactor(false);
                  setVerificationCode("");
                  setRecoveryCode("");
                  setUseRecoveryCode(false);
                  setTwoFactorInfo("");
                  setError("");
                }}
                className="mt-2 border-none bg-transparent p-0 text-[12px] text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
              >
                Use different credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseRecoveryCode((prev) => !prev);
                  setVerificationCode("");
                  setRecoveryCode("");
                  setError("");
                }}
                className="ml-3 mt-2 border-none bg-transparent p-0 text-[12px] text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
              >
                {useRecoveryCode ? "Use email verification code" : "Use recovery code"}
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <label className="text-[12px] font-medium text-slate-400 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[14px] outline-none placeholder:text-slate-600 focus:border-[#B8956A] transition-colors"
                required
              />
              <div className="mt-2 text-right">
                <Link
                  href="/admin/login/forgot-password"
                  className="text-[12px] text-slate-400 no-underline hover:text-slate-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#B8956A] rounded-lg text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#A07D5A] disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : requiresTwoFactor ? "Verify" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-[12px] mt-6">
          First time? Run the seed script to create an admin account.
        </p>
      </div>
    </div>
  );
}
