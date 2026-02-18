import { prisma } from "@/lib/prisma";
import ReviewsListClient from "@/components/admin/ReviewsListClient";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true, slug: true, watchRef: true, rating: true, status: true, views: true, createdAt: true, brand: { select: { name: true } }, author: { select: { name: true } } } });
  return <ReviewsListClient reviews={reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))} />;
}
