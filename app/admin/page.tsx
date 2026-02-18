import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/admin/DashboardClient";

export default async function AdminDashboard() {
  // Fetch stats server-side
  const [postCount, reviewCount, brandCount, draftCount, recentPosts, recentReviews] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.brand.count(),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.findMany({
      take: 7,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, status: true, views: true, createdAt: true, author: { select: { name: true } } },
    }),
    prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, rating: true, status: true, views: true, createdAt: true, brand: { select: { name: true } } },
    }),
  ]);

  return (
    <DashboardClient
      stats={{ posts: postCount, reviews: reviewCount, brands: brandCount, drafts: draftCount }}
      recentPosts={recentPosts.map(p => ({ ...p, createdAt: p.createdAt.toISOString() }))}
      recentReviews={recentReviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))}
    />
  );
}
