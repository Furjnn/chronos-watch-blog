import { prisma } from "@/lib/prisma";
import AuthorsClient from "@/components/admin/AuthorsClient";

export default async function AuthorsPage() {
  const authors = await prisma.author.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true, reviews: true } } } });
  return <AuthorsClient authors={authors.map(a => ({ ...a, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() }))} />;
}
