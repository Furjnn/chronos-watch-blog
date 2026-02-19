import { prisma } from "@/lib/prisma";
import ReviewsListClient from "@/components/admin/ReviewsListClient";

export default async function ReviewsPage() {
  const now = new Date();
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true, slug: true, watchRef: true, rating: true, status: true, views: true, scheduledAt: true, createdAt: true, brand: { select: { name: true } }, author: { select: { name: true } } } });
  return <ReviewsListClient reviews={reviews.map(r => ({ ...r, isScheduled: r.status === "DRAFT" && !!r.scheduledAt && r.scheduledAt > now, scheduledAt: r.scheduledAt?.toISOString() || null, createdAt: r.createdAt.toISOString() }))} />;
}
