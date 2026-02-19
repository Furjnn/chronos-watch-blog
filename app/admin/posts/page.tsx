import { prisma } from "@/lib/prisma";
import PostsListClient from "@/components/admin/PostsListClient";

export default async function PostsPage() {
  const now = new Date();
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, featured: true, views: true, scheduledAt: true, publishedAt: true, createdAt: true, author: { select: { name: true } }, categories: { select: { name: true } } },
  });
  return <PostsListClient posts={posts.map(p => ({ ...p, isScheduled: p.status === "DRAFT" && !!p.scheduledAt && p.scheduledAt > now, scheduledAt: p.scheduledAt?.toISOString() || null, publishedAt: p.publishedAt?.toISOString() || null, createdAt: p.createdAt.toISOString() }))} />;
}
