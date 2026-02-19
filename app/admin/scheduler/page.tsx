import { prisma } from "@/lib/prisma";
import SchedulerClient from "@/components/admin/SchedulerClient";

export default async function SchedulerPage() {
  const now = new Date();
  const [scheduledPosts, scheduledReviews] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "DRAFT",
        scheduledAt: { not: null },
      },
      orderBy: { scheduledAt: "asc" },
      take: 120,
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      where: {
        status: "DRAFT",
        scheduledAt: { not: null },
      },
      orderBy: { scheduledAt: "asc" },
      take: 120,
      select: {
        id: true,
        title: true,
        scheduledAt: true,
        brand: { select: { name: true } },
      },
    }),
  ]);

  return (
    <SchedulerClient
      dueNow={{
        posts: scheduledPosts.filter((item) => item.scheduledAt && item.scheduledAt <= now).length,
        reviews: scheduledReviews.filter((item) => item.scheduledAt && item.scheduledAt <= now).length,
      }}
      posts={scheduledPosts.map((item) => ({
        id: item.id,
        title: item.title,
        scheduledAt: item.scheduledAt?.toISOString() || null,
        meta: item.author?.name || "Unknown author",
      }))}
      reviews={scheduledReviews.map((item) => ({
        id: item.id,
        title: item.title,
        scheduledAt: item.scheduledAt?.toISOString() || null,
        meta: item.brand?.name || "Unknown brand",
      }))}
    />
  );
}
