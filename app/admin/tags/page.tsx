import { prisma } from "@/lib/prisma";
import TagsClient from "@/components/admin/TagsClient";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  return <TagsClient tags={tags.map(t => ({ ...t, createdAt: t.createdAt.toISOString() }))} />;
}
