import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminForgotPasswordForm from "@/components/admin/AdminForgotPasswordForm";

export default async function AdminForgotPasswordPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return <AdminForgotPasswordForm />;
}
