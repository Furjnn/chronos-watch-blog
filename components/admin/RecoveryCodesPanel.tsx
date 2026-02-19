"use client";

import { useState } from "react";

type RecoveryCodesPanelProps = {
  enabled: boolean;
  initialRecoveryCodeCount: number;
};

export default function RecoveryCodesPanel({
  enabled,
  initialRecoveryCodeCount,
}: RecoveryCodesPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [count, setCount] = useState(initialRecoveryCodeCount);

  const generateCodes = async () => {
    if (!enabled) return;
    const confirmed = window.confirm(
      "Generating new recovery codes will invalidate old ones. Continue?",
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/2fa/recovery-codes", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to generate recovery codes");
        setLoading(false);
        return;
      }

      const nextCodes = Array.isArray(data.codes)
        ? data.codes.filter((item: unknown) => typeof item === "string")
        : [];
      setCodes(nextCodes);
      setCount(nextCodes.length);
      setMessage("New recovery codes generated. Save them in a safe place.");
      setLoading(false);
    } catch {
      setError("Something went wrong while generating recovery codes.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-800">My 2FA Recovery Codes</h2>
          <p className="mt-1 text-[12px] text-slate-500">
            Use one code per login when email verification is unavailable.
          </p>
        </div>
        <button
          onClick={generateCodes}
          disabled={!enabled || loading}
          className="px-3 py-2 rounded-lg bg-[#B8956A] text-white text-[12px] font-semibold border-none cursor-pointer disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate New Codes"}
        </button>
      </div>

      <div className="mt-3 text-[12px] text-slate-500">
        2FA status: {enabled ? "Enabled" : "Disabled"} | Saved recovery codes: {count}
      </div>

      {!enabled && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
          Enable 2FA on your admin user before generating recovery codes.
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
          {message}
        </div>
      )}

      {codes.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[12px] font-semibold text-slate-700 mb-2">
            Save these codes now. They will not be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {codes.map((code) => (
              <div
                key={code}
                className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-mono font-semibold text-slate-700"
              >
                {code}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
