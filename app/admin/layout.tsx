import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { getAdminNotificationFeed } from "@/lib/admin-notifications";
import { maybeRunSystemHealthMonitor } from "@/lib/system-monitor";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "";
  const isLoginRoute = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (!session) {
    if (pathname && !isLoginRoute) {
      const loginPath = pathname === "/admin" ? "/admin/login" : `/admin/login?next=${encodeURIComponent(pathname)}`;
      redirect(loginPath);
    }

    return (
      <div className="admin-layout">
        <style dangerouslySetInnerHTML={{ __html: `
          .admin-layout ~ footer, 
          body > header, 
          body > div > header,
          nav:has(a[href="/about"]),
          .scroll-progress,
          header:has(nav) { display: none !important; }
          .admin-layout { margin-top: -56px; }
        `}} />
        {children}
      </div>
    );
  }

  await maybeRunSystemHealthMonitor();
  const [currentUser, notificationFeed] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true, avatar: true },
    }),
    getAdminNotificationFeed({
      userId: session.id,
      limit: 10,
      includeRead: true,
    }),
  ]);

  return (
    <div className="admin-layout">
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, 
        body > div > header,
        nav:has(a[href="/about"]),
        .scroll-progress,
        header:has(nav),
        footer { display: none !important; }
        .admin-layout { margin-top: -56px; }
      `}} />
      <div className="flex h-screen overflow-hidden bg-[#F1F5F9]" style={{ paddingTop: 56 }}>
        <AdminSidebar userRole={session.role} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader
            userName={currentUser?.name || session.email}
            userEmail={currentUser?.email || session.email}
            userAvatar={currentUser?.avatar || null}
            initialNotifications={notificationFeed.items.map((item) => ({
              id: item.id,
              title: item.title,
              message: item.message,
              href: item.href,
              severity: item.severity,
              unread: item.unread,
              createdAt: item.createdAt,
            }))}
            initialUnreadNotificationCount={notificationFeed.unreadCount}
          />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
