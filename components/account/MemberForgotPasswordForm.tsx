"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function MemberForgotPasswordForm() {
  const { t, localizePath } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loginHref = localizePath("/account/login");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/member/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("auth.requestFailed", "Request failed"));
        setLoading(false);
        return;
      }
      setMessage(
        data.message ||
          t(
            "auth.resetSent",
            "If an account exists for this email, a password reset link has been sent.",
          ),
      );
      setLoading(false);
    } catch {
      setError(t("auth.somethingWrong", "Something went wrong"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-[420px] rounded-2xl border border-[var(--border)] bg-white p-7 shadow-sm">
        <h1 className="text-[28px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
          {t("auth.forgotPassword", "Forgot password")}
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-light)]">
          {t("auth.forgotPasswordHint", "Enter your email and we will send you a reset link.")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>}
          {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">{message}</div>}

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-light)]">{t("auth.email", "Email")}</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("auth.emailPlaceholder", "you@example.com")}
              className="w-full rounded-lg border border-[var(--border)] px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--gold)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--charcoal)] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("auth.sending", "Sending...") : t("auth.sendResetLink", "Send reset link")}
          </button>
        </form>

        <p className="mt-5 text-[13px] text-[var(--text-light)]">
          <Link href={loginHref} className="font-semibold text-[var(--charcoal)] no-underline hover:text-[var(--gold)]">
            {t("auth.backToSignIn", "Back to sign in")}
          </Link>
        </p>
      </div>
    </div>
  );
}
