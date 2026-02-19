"use client";

import Link from "next/link";

type RangeDays = 7 | 30 | 90;

interface DashboardStats {
  posts: number;
  reviews: number;
  brands: number;
  drafts: number;
  scheduledPosts: number;
  scheduledReviews: number;
  pendingSubmissions: number;
  pendingComments: number;
  activeMembers: number;
  timedOutMembers: number;
  bannedMembers: number;
  totalViews: number;
  totalPostViews: number;
  totalReviewViews: number;
  averageReviewRating: number;
  postsInRange: number;
  reviewsInRange: number;
  postsDelta: number | null;
  reviewsDelta: number | null;
  newMembersInRange: number;
  membersDelta: number | null;
  memberSubmissionTotal: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  newsletterSignupsInRange: number;
  commentsSubmittedInRange: number;
  searchQueriesInRange: number;
  memberLoginsInRange: number;
  failedAdminLoginsInRange: number;
  rateLimitedLoginsInRange: number;
}

interface DashboardPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  createdAt: string;
  author: { name: string } | null;
}

interface DashboardReview {
  id: string;
  title: string;
  slug: string;
  rating: number;
  status: string;
  views: number;
  createdAt: string;
  brand: { name: string } | null;
}

interface SubmissionItem {
  id: string;
  title: string;
  approvalStatus: string;
  createdAt: string;
  memberName: string;
}

interface TopPostItem {
  id: string;
  title: string;
  slug: string;
  views: number;
  publishedAt: string | null;
  author: { name: string } | null;
}

interface TopReviewItem {
  id: string;
  title: string;
  slug: string;
  views: number;
  rating: number;
  publishedAt: string | null;
  brand: { name: string } | null;
}

interface CategoryBreakdownItem {
  id: string;
  name: string;
  count: number;
  share: number;
}

interface TrendItem {
  date: string;
  label: string;
  posts: number;
  reviews: number;
  total: number;
}

interface RisingContentItem {
  id: string;
  kind: "POST" | "REVIEW";
  title: string;
  slug: string;
  views: number;
  publishedAt: string | null;
  meta: string;
  rating: number | null;
  viewsPerDay: number;
  momentum: number;
}

interface Props {
  selectedRange: RangeDays;
  stats: DashboardStats;
  recentPosts: DashboardPost[];
  recentReviews: DashboardReview[];
  recentSubmissions: SubmissionItem[];
  topPosts: TopPostItem[];
  topReviews: TopReviewItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  publishingTrend: TrendItem[];
  risingContent: RisingContentItem[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function shortDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function deltaLabel(value: number | null) {
  if (value === null) return "new";
  if (value === 0) return "0%";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function deltaClass(value: number | null) {
  if (value === null) return "text-blue-600 bg-blue-50";
  if (value > 0) return "text-emerald-600 bg-emerald-50";
  if (value < 0) return "text-red-600 bg-red-50";
  return "text-slate-500 bg-slate-100";
}

function statusPill(status: string) {
  if (status === "PUBLISHED") return "bg-emerald-50 text-emerald-700";
  if (status === "DRAFT") return "bg-amber-50 text-amber-700";
  if (status === "ARCHIVED") return "bg-slate-100 text-slate-600";
  if (status === "PENDING") return "bg-blue-50 text-blue-700";
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (status === "REJECTED") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

function TrendBars({ data, rangeDays }: { data: TrendItem[]; rangeDays: RangeDays }) {
  const maxValue = Math.max(1, ...data.map((item) => item.total));
  const labelStep = rangeDays === 90 ? 14 : rangeDays === 30 ? 5 : 2;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-800">Publishing Trend ({rangeDays} Days)</h2>
          <p className="text-[12px] text-slate-400 mt-1">Posts and reviews published per day</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Posts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Reviews
          </span>
        </div>
      </div>

      <div className="h-[220px] border border-slate-100 rounded-lg px-3 py-3 flex items-end gap-1.5 bg-slate-50/50 overflow-x-auto">
        {data.map((point, index) => {
          const totalHeight = Math.max((point.total / maxValue) * 100, point.total > 0 ? 8 : 0);
          const postPart = point.total > 0 ? (point.posts / point.total) * totalHeight : 0;
          const reviewPart = point.total > 0 ? (point.reviews / point.total) * totalHeight : 0;
          const showLabel = index % labelStep === 0 || index === data.length - 1;

          return (
            <div key={point.date} className="min-w-[18px] flex-1 h-full flex flex-col items-center justify-end gap-2">
              <div className="w-full max-w-[18px] h-[160px] rounded-md border border-slate-200 bg-white flex flex-col justify-end overflow-hidden">
                {point.reviews > 0 && (
                  <div
                    className="w-full bg-amber-500 transition-all"
                    style={{ height: `${reviewPart}%` }}
                    title={`${point.reviews} reviews`}
                  />
                )}
                {point.posts > 0 && (
                  <div
                    className="w-full bg-blue-500 transition-all"
                    style={{ height: `${postPart}%` }}
                    title={`${point.posts} posts`}
                  />
                )}
              </div>
              <div className="text-[10px] text-slate-400 min-h-[14px]">
                {showLabel ? point.label : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardClient({
  selectedRange,
  stats,
  recentPosts,
  recentReviews,
  recentSubmissions,
  topPosts,
  topReviews,
  categoryBreakdown,
  publishingTrend,
  risingContent,
}: Props) {
  const rangeOptions: RangeDays[] = [7, 30, 90];

  const overviewCards = [
    {
      label: "Published Posts",
      value: formatNumber(stats.posts),
      sub: `${stats.postsInRange} in last ${selectedRange} days`,
      delta: stats.postsDelta,
      href: "/admin/posts",
      gradient: "from-blue-500 to-blue-600",
      icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    },
    {
      label: "Published Reviews",
      value: formatNumber(stats.reviews),
      sub: `${stats.reviewsInRange} in last ${selectedRange} days`,
      delta: stats.reviewsDelta,
      href: "/admin/reviews",
      gradient: "from-amber-500 to-amber-600",
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    },
    {
      label: "Pending Submissions",
      value: formatNumber(stats.pendingSubmissions),
      sub: `${stats.memberSubmissionTotal} total submissions, ${stats.pendingComments} pending comments`,
      delta: null,
      href: "/admin/submissions",
      gradient: "from-violet-500 to-violet-600",
      icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h4m10 0h-6m6 0v6m0-6L10 14",
    },
    {
      label: "Total Views",
      value: formatNumber(stats.totalViews),
      sub: `${formatNumber(stats.totalPostViews)} post + ${formatNumber(stats.totalReviewViews)} review`,
      delta: null,
      href: "/admin/posts",
      gradient: "from-emerald-500 to-emerald-600",
      icon: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 3a3 3 0 100-6 3 3 0 000 6z",
    },
    {
      label: "Conversion Events",
      value: formatNumber(stats.newsletterSignupsInRange + stats.memberLoginsInRange + stats.commentsSubmittedInRange),
      sub: `${stats.newsletterSignupsInRange} newsletter, ${stats.memberLoginsInRange} logins`,
      delta: null,
      href: "/admin/security",
      gradient: "from-fuchsia-500 to-rose-500",
      icon: "M3 3h18v18H3V3zm4 12h2V8H7v7zm4 0h2V5h-2v10zm4 0h2v-4h-2v4z",
    },
    {
      label: "Active Members",
      value: formatNumber(stats.activeMembers),
      sub: `${stats.newMembersInRange} new in last ${selectedRange} days`,
      delta: stats.membersDelta,
      href: "/admin/members",
      gradient: "from-sky-500 to-cyan-600",
      icon: "M17 20h5v-1a4 4 0 00-5.3-3.8M9 20H4v-1a4 4 0 015.3-3.8M16 6a3 3 0 11-6 0 3 3 0 016 0zM8 6a3 3 0 11-6 0 3 3 0 016 0zM16 14a4 4 0 00-8 0v1h8v-1z",
    },
    {
      label: "Draft Queue",
      value: formatNumber(stats.drafts),
      sub: `${stats.scheduledPosts + stats.scheduledReviews} scheduled items in queue`,
      delta: null,
      href: "/admin/scheduler",
      gradient: "from-yellow-500 to-orange-500",
      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            Dashboard
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            Editorial health, pipeline status, and engagement snapshot for Chronos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-lg">
            {rangeOptions.map((days) => (
              <Link
                key={days}
                href={`/admin?range=${days}`}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-md no-underline transition-colors ${
                  selectedRange === days
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {days}d
              </Link>
            ))}
          </div>

          <Link href="/admin/submissions" className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 no-underline hover:border-[#B8956A]/40 hover:text-slate-900 transition-colors">
            Review Submissions
          </Link>
          <Link href="/admin/posts/new" className="flex items-center gap-2 px-5 py-2.5 bg-[#B8956A] text-white rounded-lg text-[13px] font-semibold no-underline hover:bg-[#A07D5A] transition-colors shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Write New Post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {overviewCards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-xl border border-slate-200 p-5 no-underline hover:shadow-sm hover:border-[#B8956A]/25 transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] text-slate-500 uppercase tracking-[0.8px]">{card.label}</p>
                <p className="text-[34px] font-semibold text-slate-900 leading-none mt-1 tabular-nums">{card.value}</p>
                <p className="text-[12px] text-slate-400 mt-2">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${deltaClass(card.delta)}`}>
                {deltaLabel(card.delta)}
              </span>
              <span className="text-[12px] text-slate-400 group-hover:text-slate-600 transition-colors">Open</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 mb-8">
        <TrendBars data={publishingTrend} rangeDays={selectedRange} />

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-800 mb-4">Moderation and Quality</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Approved submissions</span>
              <span className="font-semibold text-emerald-700">{formatNumber(stats.approvedSubmissions)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Rejected submissions</span>
              <span className="font-semibold text-red-600">{formatNumber(stats.rejectedSubmissions)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Pending comments</span>
              <span className="font-semibold text-violet-700">{formatNumber(stats.pendingComments)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Scheduled queue</span>
              <span className="font-semibold text-blue-700">{formatNumber(stats.scheduledPosts + stats.scheduledReviews)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Timed out members</span>
              <span className="font-semibold text-amber-700">{formatNumber(stats.timedOutMembers)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Banned members</span>
              <span className="font-semibold text-red-700">{formatNumber(stats.bannedMembers)}</span>
            </div>
            <div className="h-px bg-slate-100 my-1" />
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Average review score</span>
              <span className="font-semibold text-[#B8956A]">{stats.averageReviewRating.toFixed(2)} / 10</span>
            </div>
            <div className="h-px bg-slate-100 my-1" />
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Search queries ({selectedRange}d)</span>
              <span className="font-semibold text-slate-700">{formatNumber(stats.searchQueriesInRange)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Failed admin logins ({selectedRange}d)</span>
              <span className="font-semibold text-rose-700">{formatNumber(stats.failedAdminLoginsInRange)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500">Rate-limited logins ({selectedRange}d)</span>
              <span className="font-semibold text-rose-700">{formatNumber(stats.rateLimitedLoginsInRange)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="text-[15px] font-semibold text-slate-800">Fastest Rising Content ({selectedRange} Days)</h2>
          <div className="text-[12px] text-slate-400">Momentum by views/day</div>
        </div>
        <div className="divide-y divide-slate-50">
          {risingContent.length === 0 ? (
            <div className="px-6 py-10 text-center text-[13px] text-slate-400">Not enough published content in this range yet.</div>
          ) : (
            risingContent.map((item, index) => (
              <Link
                key={`${item.kind}-${item.id}`}
                href={item.kind === "POST" ? `/admin/posts/${item.id}/edit` : `/admin/reviews/${item.id}/edit`}
                className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-400 mb-0.5">
                    #{index + 1} - {item.kind === "POST" ? "Post" : "Review"} - {item.meta} - {shortDate(item.publishedAt)}
                  </div>
                  <div className="text-[14px] font-medium text-slate-700 group-hover:text-[#B8956A] truncate transition-colors">
                    {item.title}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-semibold text-slate-700 tabular-nums">{formatNumber(item.viewsPerDay)} views/day</div>
                  <div className="text-[11px] text-slate-400">
                    {formatNumber(item.views)} total views
                    {item.rating !== null ? ` - ${item.rating.toFixed(1)}/10` : ""}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-[15px] font-semibold text-slate-800">Top Posts by Views ({selectedRange} Days)</h2>
            <Link href="/admin/posts" className="text-[12px] font-medium text-[#B8956A] no-underline hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {topPosts.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-slate-400">No published posts in this range yet.</div>
            ) : (
              topPosts.map((post, index) => (
                <Link key={post.id} href={`/admin/posts/${post.id}/edit`} className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-slate-400 mb-0.5">#{index + 1} - {post.author?.name || "Unknown author"} - {shortDate(post.publishedAt)}</div>
                    <div className="text-[14px] font-medium text-slate-700 group-hover:text-[#B8956A] truncate transition-colors">{post.title}</div>
                  </div>
                  <div className="text-[12px] font-semibold text-slate-500 tabular-nums">{formatNumber(post.views)} views</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-[15px] font-semibold text-slate-800">Top Reviews by Views ({selectedRange} Days)</h2>
            <Link href="/admin/reviews" className="text-[12px] font-medium text-[#B8956A] no-underline hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {topReviews.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-slate-400">No published reviews in this range yet.</div>
            ) : (
              topReviews.map((review, index) => (
                <Link key={review.id} href={`/admin/reviews/${review.id}/edit`} className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-slate-400 mb-0.5">#{index + 1} - {review.brand?.name || "Unknown brand"} - {shortDate(review.publishedAt)}</div>
                    <div className="text-[14px] font-medium text-slate-700 group-hover:text-[#B8956A] truncate transition-colors">{review.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold text-slate-500 tabular-nums">{formatNumber(review.views)} views</div>
                    <div className="text-[11px] text-[#B8956A] font-semibold">{review.rating.toFixed(1)} / 10</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr] gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-[15px] font-semibold text-slate-800">Recent Content Activity</h2>
            <div className="text-[12px] text-slate-400">Posts and reviews</div>
          </div>
          <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
            {[...recentPosts.map((item) => ({ ...item, type: "Post" as const })), ...recentReviews.map((item) => ({ ...item, type: "Review" as const }))]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
              .map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.type === "Post" ? `/admin/posts/${item.id}/edit` : `/admin/reviews/${item.id}/edit`}
                  className="flex items-center justify-between gap-3 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-slate-400 mb-0.5">
                      {item.type} - {timeAgo(item.createdAt)}
                    </div>
                    <div className="text-[14px] font-medium text-slate-700 group-hover:text-[#B8956A] truncate transition-colors">
                      {item.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{formatNumber(item.views)} views</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusPill(item.status)}`}>{item.status}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-[15px] font-semibold text-slate-800">Submission Queue</h2>
            <Link href="/admin/submissions" className="text-[12px] font-medium text-[#B8956A] no-underline hover:underline">
              Open
            </Link>
          </div>
          <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
            {recentSubmissions.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-slate-400">No member submissions yet.</div>
            ) : (
              recentSubmissions.map((item) => (
                <Link key={item.id} href="/admin/submissions" className="block px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors group">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusPill(item.approvalStatus)}`}>
                      {item.approvalStatus}
                    </span>
                    <span className="text-[11px] text-slate-400">{timeAgo(item.createdAt)}</span>
                  </div>
                  <div className="text-[13px] font-medium text-slate-700 truncate group-hover:text-[#B8956A] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.memberName}</div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-[15px] font-semibold text-slate-800">Category Mix</h2>
            <Link href="/admin/categories" className="text-[12px] font-medium text-[#B8956A] no-underline hover:underline">
              Manage
            </Link>
          </div>
          <div className="px-6 py-4 space-y-3">
            {categoryBreakdown.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-slate-400">No category data yet.</div>
            ) : (
              categoryBreakdown.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-slate-600 font-medium">{item.name}</span>
                    <span className="text-slate-400">{item.count} posts</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#B8956A] to-[#A07D5A]" style={{ width: `${Math.max(item.share, 6)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
