import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, authors, categories, tags, brands] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { author: true, categories: true, tags: true, brand: true } }),
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();
  return <PostForm post={post} authors={authors} categories={categories} tags={tags} brands={brands} />;
}
