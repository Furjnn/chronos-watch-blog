import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import MemberRegisterForm from "@/components/account/MemberRegisterForm";
import { getLocale } from "@/lib/i18n";
import { localizePathname } from "@/lib/i18n/routing";

export default async function MemberRegisterPage() {
  const locale = await getLocale();
  const session = await getMemberSession();
  if (session) {
    redirect(localizePathname("/account", locale));
  }

  return <MemberRegisterForm />;
}
