"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function MemberRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, localizePath } = useI18n();
  const nextPath = searchParams.get("next") || localizePath("/account");
  const loginHref = localizePath(`/account/login?next=${encodeURIComponent(nextPath)}`);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("auth.registrationFailed", "Registration failed"));
        setLoading(false);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError(t("auth.somethingWrong", "Something went wrong"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-[420px] rounded-2xl border border-[var(--border)] bg-white p-7 shadow-sm">
        <h1 className="text-[28px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
          {t("auth.signUpTitle", "Create account")}
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-light)]">{t("auth.signUpSubtitle", "Join Chronos for a personalized reading experience.")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>}

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-light)]">{t("auth.name", "Name")}</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("auth.yourName", "Your name")}
              className="w-full rounded-lg border border-[var(--border)] px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--gold)]"
              required
            />
          </div>

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

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-light)]">{t("auth.password", "Password")}</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              placeholder={t("auth.passwordHint", "At least 8 characters")}
              className="w-full rounded-lg border border-[var(--border)] px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--gold)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--charcoal)] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("auth.creatingAccount", "Creating account...") : t("auth.createAccount", "Create Account")}
          </button>
        </form>

        <p className="mt-5 text-[13px] text-[var(--text-light)]">
          {t("auth.alreadyMember", "Already a member?")} {" "}
          <Link href={loginHref} className="font-semibold text-[var(--charcoal)] no-underline hover:text-[var(--gold)]">
            {t("auth.signIn", "Sign In")}
          </Link>
        </p>
      </div>
    </div>
  );
}
