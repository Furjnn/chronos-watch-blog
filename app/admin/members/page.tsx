import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import MembersClient from "@/components/admin/MembersClient";

export default async function MembersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin");
  }

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      timeoutUntil: true,
      moderationReason: true,
      moderatedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return (
    <MembersClient
      members={members.map((member) => ({
        ...member,
        timeoutUntil: member.timeoutUntil ? member.timeoutUntil.toISOString() : null,
        moderatedAt: member.moderatedAt ? member.moderatedAt.toISOString() : null,
        createdAt: member.createdAt.toISOString(),
        updatedAt: member.updatedAt.toISOString(),
      }))}
    />
  );
}
