import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import { getLocale } from "@/lib/i18n";
import { localizePathname } from "@/lib/i18n/routing";
import MemberForgotPasswordForm from "@/components/account/MemberForgotPasswordForm";

export default async function MemberForgotPasswordPage() {
  const locale = await getLocale();
  const session = await getMemberSession();
  if (session) {
    redirect(localizePathname("/account", locale));
  }

  return <MemberForgotPasswordForm />;
}
