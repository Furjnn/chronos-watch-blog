import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminResetPasswordForm from "@/components/admin/AdminResetPasswordForm";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const resolved = searchParams ? await searchParams : undefined;
  const token = typeof resolved?.token === "string" ? resolved.token : "";

  return <AdminResetPasswordForm token={token} />;
}
