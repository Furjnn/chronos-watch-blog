import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import SubmissionsClient from "@/components/admin/SubmissionsClient";

export default async function AdminSubmissionsPage() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
    redirect("/admin");
  }

  const submissions = await prisma.post.findMany({
    where: { submittedByMemberId: { not: null } },
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
      reviewedAt: true,
      publishedAt: true,
      submittedByMember: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return (
    <SubmissionsClient
      submissions={submissions.map((submission) => ({
        ...submission,
        createdAt: submission.createdAt.toISOString(),
        reviewedAt: submission.reviewedAt ? submission.reviewedAt.toISOString() : null,
        publishedAt: submission.publishedAt ? submission.publishedAt.toISOString() : null,
      }))}
    />
  );
}
