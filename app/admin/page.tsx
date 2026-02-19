import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/admin/DashboardClient";
import { maybeRunScheduledPublishing } from "@/lib/scheduler";

type RangeDays = 7 | 30 | 90;

const ALLOWED_RANGES: RangeDays[] = [7, 30, 90];

function parseRange(value: string | undefined): RangeDays {
  const parsed = Number(value);
  if (ALLOWED_RANGES.includes(parsed as RangeDays)) {
    return parsed as RangeDays;
  }
  return 30;
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function percentDelta(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  await maybeRunScheduledPublishing();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedRange = parseRange(resolvedSearchParams?.range);

  const now = new Date();
  const today = startOfDay(now);
  const currentStart = new Date(today);
  currentStart.setDate(currentStart.getDate() - (selectedRange - 1));
  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - selectedRange);

  const [
    publishedPostCount,
    publishedReviewCount,
    brandCount,
    draftPostCount,
    scheduledPostCount,
    scheduledReviewCount,
    pendingSubmissionCount,
    pendingCommentCount,
    activeMemberCount,
    timeoutMemberCount,
    bannedMemberCount,
    submittedPostTotal,
    approvedSubmissionTotal,
    rejectedSubmissionTotal,
    postsInRange,
    postsPreviousRange,
    reviewsInRange,
    reviewsPreviousRange,
    newMembersInRange,
    newMembersPreviousRange,
    postViewsAggregate,
    reviewViewsAggregate,
    reviewRatingAggregate,
    recentPosts,
    recentReviews,
    recentSubmissions,
    topPosts,
    topReviews,
    populatedCategories,
    trendPosts,
    trendReviews,
    risingPostsSource,
    risingReviewsSource,
    newsletterSignupsInRange,
    commentsSubmittedInRange,
    searchQueriesInRange,
    memberLoginsInRange,
    failedAdminLoginsInRange,
    rateLimitedLoginsInRange,
  ] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.brand.count(),
    prisma.post.count({ where: { status: "DRAFT", submittedByMemberId: null } }),
    prisma.post.count({ where: { status: "DRAFT", scheduledAt: { not: null } } }),
    prisma.review.count({ where: { status: "DRAFT", scheduledAt: { not: null } } }),
    prisma.post.count({ where: { approvalStatus: "PENDING", submittedByMemberId: { not: null } } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.member.count({ where: { status: "TIMEOUT" } }),
    prisma.member.count({ where: { status: "BANNED" } }),
    prisma.post.count({ where: { submittedByMemberId: { not: null } } }),
    prisma.post.count({ where: { submittedByMemberId: { not: null }, approvalStatus: "APPROVED" } }),
    prisma.post.count({ where: { submittedByMemberId: { not: null }, approvalStatus: "REJECTED" } }),
    prisma.post.count({ where: { status: "PUBLISHED", publishedAt: { gte: currentStart } } }),
    prisma.post.count({ where: { status: "PUBLISHED", publishedAt: { gte: previousStart, lt: currentStart } } }),
    prisma.review.count({ where: { status: "PUBLISHED", publishedAt: { gte: currentStart } } }),
    prisma.review.count({ where: { status: "PUBLISHED", publishedAt: { gte: previousStart, lt: currentStart } } }),
    prisma.member.count({ where: { createdAt: { gte: currentStart } } }),
    prisma.member.count({ where: { createdAt: { gte: previousStart, lt: currentStart } } }),
    prisma.post.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { views: true },
    }),
    prisma.review.aggregate({
      where: { status: "PUBLISHED" },
      _sum: { views: true },
    }),
    prisma.review.aggregate({
      where: { status: "PUBLISHED" },
      _avg: { rating: true },
    }),
    prisma.post.findMany({
      take: 7,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        views: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        rating: true,
        status: true,
        views: true,
        createdAt: true,
        brand: { select: { name: true } },
      },
    }),
    prisma.post.findMany({
      where: { submittedByMemberId: { not: null } },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        approvalStatus: true,
        createdAt: true,
        submittedByMember: { select: { name: true } },
      },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: currentStart } },
      take: 5,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: currentStart } },
      take: 5,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        rating: true,
        publishedAt: true,
        brand: { select: { name: true } },
      },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { posts: true } },
      },
      orderBy: { posts: { _count: "desc" } },
      take: 8,
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: currentStart } },
      select: { publishedAt: true },
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: currentStart } },
      select: { publishedAt: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: currentStart } },
      take: 24,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: currentStart } },
      take: 24,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        rating: true,
        publishedAt: true,
        brand: { select: { name: true } },
      },
    }),
    prisma.metricEvent.count({
      where: {
        type: "NEWSLETTER_SIGNUP",
        createdAt: { gte: currentStart },
      },
    }),
    prisma.metricEvent.count({
      where: {
        type: "COMMENT_SUBMITTED",
        createdAt: { gte: currentStart },
      },
    }),
    prisma.metricEvent.count({
      where: {
        type: "SEARCH_QUERY",
        createdAt: { gte: currentStart },
      },
    }),
    prisma.metricEvent.count({
      where: {
        type: "MEMBER_LOGIN",
        createdAt: { gte: currentStart },
      },
    }),
    prisma.securityEvent.count({
      where: {
        type: "LOGIN_FAILED",
        success: false,
        createdAt: { gte: currentStart },
      },
    }),
    prisma.securityEvent.count({
      where: {
        type: { in: ["LOGIN_RATE_LIMITED", "MEMBER_LOGIN_RATE_LIMITED"] },
        createdAt: { gte: currentStart },
      },
    }),
  ]);

  const totalPostViews = postViewsAggregate._sum.views || 0;
  const totalReviewViews = reviewViewsAggregate._sum.views || 0;
  const totalViews = totalPostViews + totalReviewViews;

  const postsDelta = percentDelta(postsInRange, postsPreviousRange);
  const reviewsDelta = percentDelta(reviewsInRange, reviewsPreviousRange);
  const membersDelta = percentDelta(newMembersInRange, newMembersPreviousRange);

  const trendSeed = new Map<string, { date: string; label: string; posts: number; reviews: number; total: number }>();
  for (let offset = selectedRange - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = dayKey(date);
    trendSeed.set(key, {
      date: key,
      label: formatDayLabel(date),
      posts: 0,
      reviews: 0,
      total: 0,
    });
  }

  trendPosts.forEach((item) => {
    if (!item.publishedAt) return;
    const key = dayKey(item.publishedAt);
    const point = trendSeed.get(key);
    if (!point) return;
    point.posts += 1;
    point.total += 1;
  });

  trendReviews.forEach((item) => {
    if (!item.publishedAt) return;
    const key = dayKey(item.publishedAt);
    const point = trendSeed.get(key);
    if (!point) return;
    point.reviews += 1;
    point.total += 1;
  });

  const publishingTrend = Array.from(trendSeed.values());
  const topCategoryCount = populatedCategories[0]?._count.posts || 0;
  const millisPerDay = 24 * 60 * 60 * 1000;

  const risingContent = [
    ...risingPostsSource.map((item) => ({
      id: item.id,
      kind: "POST" as const,
      title: item.title,
      slug: item.slug,
      views: item.views,
      publishedAt: item.publishedAt,
      meta: item.author?.name || "Unknown author",
      rating: null as number | null,
    })),
    ...risingReviewsSource.map((item) => ({
      id: item.id,
      kind: "REVIEW" as const,
      title: item.title,
      slug: item.slug,
      views: item.views,
      publishedAt: item.publishedAt,
      meta: item.brand?.name || "Unknown brand",
      rating: item.rating,
    })),
  ]
    .filter((item) => Boolean(item.publishedAt))
    .map((item) => {
      const publishedAt = item.publishedAt as Date;
      const daysLive = Math.max(1, Math.ceil((today.getTime() - publishedAt.getTime()) / millisPerDay));
      const viewsPerDay = item.views / daysLive;
      const recencyBoost = 1 + (selectedRange - Math.min(daysLive, selectedRange)) / (selectedRange * 2);
      const momentum = Math.round(viewsPerDay * recencyBoost);

      return {
        ...item,
        viewsPerDay: Math.round(viewsPerDay),
        momentum,
      };
    })
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 8);

  return (
    <DashboardClient
      selectedRange={selectedRange}
      stats={{
        posts: publishedPostCount,
        reviews: publishedReviewCount,
        brands: brandCount,
        drafts: draftPostCount,
        scheduledPosts: scheduledPostCount,
        scheduledReviews: scheduledReviewCount,
        pendingSubmissions: pendingSubmissionCount,
        pendingComments: pendingCommentCount,
        activeMembers: activeMemberCount,
        timedOutMembers: timeoutMemberCount,
        bannedMembers: bannedMemberCount,
        totalViews,
        totalPostViews,
        totalReviewViews,
        averageReviewRating: reviewRatingAggregate._avg.rating || 0,
        postsInRange,
        reviewsInRange,
        postsDelta,
        reviewsDelta,
        newMembersInRange,
        membersDelta,
        memberSubmissionTotal: submittedPostTotal,
        approvedSubmissions: approvedSubmissionTotal,
        rejectedSubmissions: rejectedSubmissionTotal,
        newsletterSignupsInRange,
        commentsSubmittedInRange,
        searchQueriesInRange,
        memberLoginsInRange,
        failedAdminLoginsInRange,
        rateLimitedLoginsInRange,
      }}
      recentPosts={recentPosts.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))}
      recentReviews={recentReviews.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))}
      recentSubmissions={recentSubmissions.map((item) => ({
        id: item.id,
        title: item.title,
        approvalStatus: item.approvalStatus,
        createdAt: item.createdAt.toISOString(),
        memberName: item.submittedByMember?.name || "Unknown member",
      }))}
      topPosts={topPosts.map((item) => ({
        ...item,
        publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      }))}
      topReviews={topReviews.map((item) => ({
        ...item,
        publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      }))}
      categoryBreakdown={populatedCategories
        .filter((category) => category._count.posts > 0)
        .map((category) => ({
          id: category.id,
          name: category.name,
          count: category._count.posts,
          share: topCategoryCount > 0 ? Math.round((category._count.posts / topCategoryCount) * 100) : 0,
        }))}
      publishingTrend={publishingTrend}
      risingContent={risingContent.map((item) => ({
        ...item,
        publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      }))}
    />
  );
}
