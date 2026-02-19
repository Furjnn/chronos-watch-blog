"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function MemberLogoutButton() {
  const router = useRouter();
  const { t, localizePath } = useI18n();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/member/logout", { method: "POST" });
    router.push(localizePath("/"));
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? t("account.signingOut", "Signing out...") : t("account.signOut", "Sign out")}
    </button>
  );
}
