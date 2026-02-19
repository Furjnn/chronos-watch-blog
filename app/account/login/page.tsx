import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import MemberLoginForm from "@/components/account/MemberLoginForm";
import { getLocale } from "@/lib/i18n";
import { localizePathname } from "@/lib/i18n/routing";

export default async function MemberLoginPage() {
  const locale = await getLocale();
  const session = await getMemberSession();
  if (session) {
    redirect(localizePathname("/account", locale));
  }

  return <MemberLoginForm />;
}
