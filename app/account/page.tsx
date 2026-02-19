import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/prisma";
import AccountDashboard from "@/components/account/AccountDashboard";
import { getLocale } from "@/lib/i18n";
import { localizePathname } from "@/lib/i18n/routing";

export default async function AccountPage() {
  const locale = await getLocale();
  const accountPath = localizePathname("/account", locale);
  const loginPath = localizePathname("/account/login", locale);
  const session = await getMemberSession();
  if (!session) {
    redirect(`${loginPath}?next=${encodeURIComponent(accountPath)}`);
  }

  const [member, posts] = await Promise.all([
    prisma.member.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.post.findMany({
      where: { submittedByMemberId: session.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        approvalStatus: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    }),
  ]);

  if (!member) {
    redirect(`${loginPath}?next=${encodeURIComponent(accountPath)}`);
  }

  return (
    <AccountDashboard
      member={{
        id: member.id,
        name: member.name,
        email: member.email,
        createdAt: member.createdAt.toISOString(),
      }}
      posts={posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      }))}
    />
  );
}
