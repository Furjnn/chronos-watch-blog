import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const [authors, categories, tags, brands] = await Promise.all([
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <PostForm authors={authors} categories={categories} tags={tags} brands={brands} />;
}
