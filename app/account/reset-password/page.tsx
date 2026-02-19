import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import { getLocale } from "@/lib/i18n";
import { localizePathname } from "@/lib/i18n/routing";
import MemberResetPasswordForm from "@/components/account/MemberResetPasswordForm";

export default async function MemberResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const locale = await getLocale();
  const session = await getMemberSession();
  if (session) {
    redirect(localizePathname("/account", locale));
  }

  const resolved = searchParams ? await searchParams : undefined;
  const token = typeof resolved?.token === "string" ? resolved.token : "";

  return <MemberResetPasswordForm token={token} />;
}
