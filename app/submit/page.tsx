import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import MemberPostComposer from "@/components/account/MemberPostComposer";
import { getDictionary, getLocale } from "@/lib/i18n";
import { localizePathname } from "@/lib/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function SubmitPostPage() {
  const locale = await getLocale();
  const session = await getMemberSession();
  if (!session) {
    redirect(`${localizePathname("/account/login", locale)}?next=${encodeURIComponent(localizePathname("/submit", locale))}`);
  }

  const dictionary = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-[1020px] px-6 pb-16 pt-28 md:px-10">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 md:p-7">
        <h1 className="text-[32px] font-semibold text-[var(--charcoal)]" style={{ fontFamily: "var(--font-display)" }}>
          {dictionary.submit.title}
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-light)]">{dictionary.submit.subtitle}</p>

        <div className="mt-6">
          <MemberPostComposer />
        </div>
      </div>
    </div>
  );
}
