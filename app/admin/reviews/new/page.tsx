import { prisma } from "@/lib/prisma";
import ReviewForm from "@/components/admin/ReviewForm";

export default async function NewReviewPage() {
  const [authors, brands] = await Promise.all([
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return <ReviewForm authors={authors} brands={brands} />;
}
