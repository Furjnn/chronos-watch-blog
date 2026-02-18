import { prisma } from "@/lib/prisma";
import CategoriesClient from "@/components/admin/CategoriesClient";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  return <CategoriesClient categories={categories.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))} />;
}
