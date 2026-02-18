import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/admin/ReviewForm";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [review, authors, brands] = await Promise.all([
    prisma.review.findUnique({ where: { id }, include: { brand: true, author: true } }),
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!review) notFound();
  return <ReviewForm review={review} authors={authors} brands={brands} />;
}
