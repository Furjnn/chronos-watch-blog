"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MemberLogoutButton from "./MemberLogoutButton";
import { useI18n } from "@/components/i18n/I18nProvider";

type MemberData = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type MemberPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

type TabId = "profile" | "posts";

const statusStyles: Record<MemberPost["approvalStatus"], string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function AccountDashboard({ member, posts }: { member: MemberData; posts: MemberPost[] }) {
  const { locale, t, localizePath } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const tabLabels: Record<TabId, string> = {
    profile: t("account.profile", "Profile"),
    posts: t("account.myPosts", "My Posts"),
  };

  const statusLabels: Record<MemberPost["approvalStatus"], string> = {
    PENDING: t("account.pending", "Pending"),
    APPROVED: t("account.approved", "Approved"),
    REJECTED: t("account.rejected", "Rejected"),
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric", year: "numeric" });

  const counts = useMemo(
    () => ({
      total: posts.length,
      pending: posts.filter((post) => post.approvalStatus === "PENDING").length,
      approved: posts.filter((post) => post.approvalStatus === "APPROVED").length,
      rejected: posts.filter((post) => post.approvalStatus === "REJECTED").length,
    }),
    [posts],
  );

  return (
    <div className="mx-auto max-w-[1020px] px-6 pb-16 pt-28 md:px-10">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[1px] text-[var(--text-light)]">{t("account.memberAccount", "Member account")}</p>
            <h1 className="mt-1 text-[34px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
              {member.name}
            </h1>
            <p className="mt-1 text-[14px] text-[var(--text-secondary)]">{member.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={localizePath("/submit")}
              className="rounded-lg bg-[var(--charcoal)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.8px] text-white no-underline transition-colors hover:bg-black"
            >
              {t("account.newPost", "New Post")}
            </Link>
            <MemberLogoutButton />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-1 rounded-xl border border-[var(--border)] bg-white p-1.5">
        {(["profile", "posts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg border-none px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.8px] transition-colors ${
              activeTab === tab
                ? "bg-[var(--charcoal)] text-white"
                : "bg-transparent text-[var(--text-light)] hover:text-[var(--charcoal)]"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-[22px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
              {t("account.profile", "Profile")}
            </h2>
            <div className="mt-4 space-y-3 text-[14px] text-[var(--text-secondary)]">
              <p><span className="font-semibold text-[var(--charcoal)]">{t("account.name", "Name")}: </span>{member.name}</p>
              <p><span className="font-semibold text-[var(--charcoal)]">{t("account.email", "Email")}: </span>{member.email}</p>
              <p><span className="font-semibold text-[var(--charcoal)]">{t("account.memberSince", "Member since")}: </span>{formatDate(member.createdAt)}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-[22px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
              {t("account.submissionStats", "Submission Stats")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-lg border border-[var(--border)] p-3">
                <p className="text-[var(--text-light)]">{t("account.total", "Total")}</p>
                <p className="mt-1 text-[20px] font-semibold text-[var(--charcoal)]">{counts.total}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-3">
                <p className="text-[var(--text-light)]">{t("account.pending", "Pending")}</p>
                <p className="mt-1 text-[20px] font-semibold text-amber-700">{counts.pending}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-3">
                <p className="text-[var(--text-light)]">{t("account.approved", "Approved")}</p>
                <p className="mt-1 text-[20px] font-semibold text-emerald-700">{counts.approved}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-3">
                <p className="text-[var(--text-light)]">{t("account.rejected", "Rejected")}</p>
                <p className="mt-1 text-[20px] font-semibold text-rose-700">{counts.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "posts" && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[24px] font-medium text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
                {t("account.mySubmissions", "My Submissions")}
              </h2>
              <p className="mt-1 text-[13px] text-[var(--text-light)]">{t("account.postsModerationInfo", "Posts are published only after admin/editor approval.")}</p>
            </div>
            <Link
              href={localizePath("/submit")}
              className="rounded-lg border border-[var(--border)] px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.8px] text-[var(--charcoal)] no-underline transition-colors hover:border-[var(--charcoal)]"
            >
              {t("account.newPost", "New Post")}
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-[14px] font-medium text-[var(--charcoal)]">{t("account.noSubmissions", "No submissions yet")}</p>
                <Link
                  href={localizePath("/submit")}
                  className="mt-3 inline-block rounded-lg bg-[var(--charcoal)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.8px] text-white no-underline"
                >
                  {t("account.submitFirstPost", "Submit First Post")}
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="rounded-xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[var(--charcoal)]">{post.title}</h3>
                      <p className="mt-1 text-[12px] text-[var(--text-light)]">
                        {t("account.submittedOn", "Submitted on")} {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[post.approvalStatus]}`}>
                      {statusLabels[post.approvalStatus]}
                    </span>
                  </div>

                  {post.excerpt && <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{post.excerpt}</p>}

                  {post.reviewNote && (
                    <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-off)] px-3 py-2 text-[12px] text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--charcoal)]">{t("account.editorialNote", "Editorial note:")}</span> {post.reviewNote}
                    </div>
                  )}

                  {post.approvalStatus === "APPROVED" && (
                    <Link
                      href={localizePath(`/blog/${post.slug}`)}
                      className="mt-3 inline-block text-[12px] font-semibold text-[var(--charcoal)] no-underline hover:text-[var(--gold)]"
                    >
                      {t("account.readPublishedPost", "Read published post")}
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
