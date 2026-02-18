import { prisma } from "@/lib/prisma";
import PostsListClient from "@/components/admin/PostsListClient";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, featured: true, views: true, publishedAt: true, createdAt: true, author: { select: { name: true } }, categories: { select: { name: true } } },
  });
  return <PostsListClient posts={posts.map(p => ({ ...p, publishedAt: p.publishedAt?.toISOString() || null, createdAt: p.createdAt.toISOString() }))} />;
}
