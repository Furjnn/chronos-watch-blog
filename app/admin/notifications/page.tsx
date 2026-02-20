import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NotificationsClient from "@/components/admin/NotificationsClient";
import { getAdminNotificationFeed } from "@/lib/admin-notifications";

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const feed = await getAdminNotificationFeed({
    userId: session.id,
    limit: 250,
    includeRead: true,
  });

  return (
    <NotificationsClient
      initialItems={feed.items}
      initialUnreadCount={feed.unreadCount}
    />
  );
}
