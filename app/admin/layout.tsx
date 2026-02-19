import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
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
          <AdminHeader userName={session.email} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
