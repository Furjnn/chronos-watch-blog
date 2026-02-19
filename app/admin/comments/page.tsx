import { prisma } from "@/lib/prisma";
import CommentsClient from "@/components/admin/CommentsClient";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      body: true,
      status: true,
      authorName: true,
      authorEmail: true,
      moderationNote: true,
      moderatedAt: true,
      createdAt: true,
      post: { select: { id: true, title: true, slug: true } },
      review: { select: { id: true, title: true, slug: true } },
      member: { select: { id: true, name: true, email: true } },
      moderatedBy: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <CommentsClient
      comments={comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        moderatedAt: comment.moderatedAt ? comment.moderatedAt.toISOString() : null,
      }))}
    />
  );
}
