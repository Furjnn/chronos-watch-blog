import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function queryMatch(query: string) {
  return { contains: query, mode: "insensitive" as const };
}

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login?next=/admin/search");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = (resolvedSearchParams?.q || "").trim();
  const isAdmin = session.role === "ADMIN";

  const [
    posts,
    reviews,
    submissions,
    brands,
    categories,
    authors,
    comments,
    members,
    users,
  ] = query
    ? await Promise.all([
        prisma.post.findMany({
          where: {
            OR: [
              { title: queryMatch(query) },
              { slug: queryMatch(query) },
              { excerpt: queryMatch(query) },
              { author: { name: queryMatch(query) } },
            ],
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            slug: true,
            views: true,
            createdAt: true,
            author: { select: { name: true } },
          },
        }),
        prisma.review.findMany({
          where: {
            OR: [
              { title: queryMatch(query) },
              { slug: queryMatch(query) },
              { watchRef: queryMatch(query) },
              { brand: { name: queryMatch(query) } },
            ],
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            slug: true,
            rating: true,
            views: true,
            createdAt: true,
            brand: { select: { name: true } },
          },
        }),
        prisma.post.findMany({
          where: {
            submittedByMemberId: { not: null },
            OR: [
              { title: queryMatch(query) },
              { slug: queryMatch(query) },
              { excerpt: queryMatch(query) },
              { submittedByMember: { name: queryMatch(query) } },
              { submittedByMember: { email: queryMatch(query) } },
            ],
          },
          take: 8,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            approvalStatus: true,
            createdAt: true,
            submittedByMember: { select: { name: true } },
          },
        }),
        prisma.brand.findMany({
          where: {
            OR: [
              { name: queryMatch(query) },
              { slug: queryMatch(query) },
              { country: queryMatch(query) },
            ],
          },
          take: 8,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            founded: true,
          },
        }),
        prisma.category.findMany({
          where: {
            OR: [
              { name: queryMatch(query) },
              { slug: queryMatch(query) },
            ],
          },
          take: 8,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { posts: true } },
          },
        }),
        prisma.author.findMany({
          where: {
            OR: [
              { name: queryMatch(query) },
              { slug: queryMatch(query) },
              { role: queryMatch(query) },
              { bio: queryMatch(query) },
            ],
          },
          take: 8,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            role: true,
            _count: { select: { posts: true, reviews: true } },
          },
        }),
        prisma.comment.findMany({
          where: {
            OR: [
              { body: queryMatch(query) },
              { authorName: queryMatch(query) },
              { authorEmail: queryMatch(query) },
              { post: { title: queryMatch(query) } },
              { review: { title: queryMatch(query) } },
            ],
          },
          take: 8,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            body: true,
            status: true,
            authorName: true,
            post: { select: { title: true } },
            review: { select: { title: true } },
          },
        }),
        isAdmin
          ? prisma.member.findMany({
              where: {
                OR: [
                  { name: queryMatch(query) },
                  { email: queryMatch(query) },
                ],
              },
              take: 8,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
                _count: { select: { posts: true } },
              },
            })
          : Promise.resolve([]),
        isAdmin
          ? prisma.user.findMany({
              where: {
                OR: [
                  { name: queryMatch(query) },
                  { email: queryMatch(query) },
                ],
              },
              take: 8,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            })
          : Promise.resolve([]),
      ])
    : [[], [], [], [], [], [], [], [], []];

  const totalResults =
    posts.length +
    reviews.length +
    submissions.length +
    brands.length +
    categories.length +
    authors.length +
    comments.length +
    members.length +
    users.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 px-6 py-5 shadow-sm">
        <h1 className="text-[24px] font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
          Admin Search
        </h1>
        {query ? (
          <p className="text-[13px] text-slate-500 mt-1">
            Showing results for <span className="font-semibold text-slate-700">&quot;{query}&quot;</span> ({totalResults} matches)
          </p>
        ) : (
          <p className="text-[13px] text-slate-500 mt-1">
            Type a query in the top search box to find content, users, members, and taxonomies.
          </p>
        )}
      </div>

      {query && totalResults === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-10 text-center text-[14px] text-slate-500 shadow-sm">
          No results found. Try a different keyword.
        </div>
      ) : null}

      {posts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
            Posts ({posts.length})
          </div>
          <div className="divide-y divide-slate-50">
            {posts.map((item) => (
              <Link key={item.id} href={`/admin/posts/${item.id}/edit`} className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-slate-800 truncate">{item.title}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">{item.author?.name || "Unknown author"} - /blog/{item.slug}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">{item.views.toLocaleString()} views</div>
                  <div className="text-[10px] text-slate-400">{item.status}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
            Reviews ({reviews.length})
          </div>
          <div className="divide-y divide-slate-50">
            {reviews.map((item) => (
              <Link key={item.id} href={`/admin/reviews/${item.id}/edit`} className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-slate-800 truncate">{item.title}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">{item.brand?.name || "Unknown brand"} - /reviews/{item.slug}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">{item.views.toLocaleString()} views</div>
                  <div className="text-[10px] text-[#B8956A]">{item.rating.toFixed(1)} / 10</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
            Member Submissions ({submissions.length})
          </div>
          <div className="divide-y divide-slate-50">
            {submissions.map((item) => (
              <Link key={item.id} href="/admin/submissions" className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-slate-800 truncate">{item.title}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">{item.submittedByMember?.name || "Unknown member"}</div>
                </div>
                <div className="text-[11px] text-slate-500">{item.approvalStatus}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
            Comments ({comments.length})
          </div>
          <div className="divide-y divide-slate-50">
            {comments.map((item) => (
              <Link key={item.id} href="/admin/comments" className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 truncate">{item.body}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">
                    {item.authorName || "Anonymous"} - {item.post?.title || item.review?.title || "Unknown context"}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">{item.status}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {brands.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
              Brands ({brands.length})
            </div>
            <div className="divide-y divide-slate-50">
              {brands.map((item) => (
                <Link key={item.id} href={`/admin/brands/${item.id}/edit`} className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="text-[14px] font-medium text-slate-800">{item.name}</div>
                    <div className="text-[12px] text-slate-400">{item.country}</div>
                  </div>
                  <div className="text-[11px] text-slate-500">{item.founded || "-"}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {authors.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
              Authors ({authors.length})
            </div>
            <div className="divide-y divide-slate-50">
              {authors.map((item) => (
                <Link key={item.id} href="/admin/authors" className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="text-[14px] font-medium text-slate-800">{item.name}</div>
                    <div className="text-[12px] text-slate-400">{item.role || "No role"}</div>
                  </div>
                  <div className="text-[11px] text-slate-500">{item._count.posts} posts / {item._count.reviews} reviews</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
              Categories ({categories.length})
            </div>
            <div className="divide-y divide-slate-50">
              {categories.map((item) => (
                <Link key={item.id} href="/admin/categories" className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="text-[14px] font-medium text-slate-800">{item.name}</div>
                    <div className="text-[12px] text-slate-400">{item.slug}</div>
                  </div>
                  <div className="text-[11px] text-slate-500">{item._count.posts} posts</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isAdmin && members.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
              Members ({members.length})
            </div>
            <div className="divide-y divide-slate-50">
              {members.map((item) => (
                <Link key={item.id} href="/admin/members" className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="text-[14px] font-medium text-slate-800">{item.name}</div>
                    <div className="text-[12px] text-slate-400">{item.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">{item.status}</div>
                    <div className="text-[10px] text-slate-400">{item._count.posts} submissions</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isAdmin && users.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 text-[14px] font-semibold text-slate-800">
              Admin Users ({users.length})
            </div>
            <div className="divide-y divide-slate-50">
              {users.map((item) => (
                <Link key={item.id} href="/admin/users" className="flex items-center justify-between gap-4 px-6 py-3.5 no-underline hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="text-[14px] font-medium text-slate-800">{item.name}</div>
                    <div className="text-[12px] text-slate-400">{item.email}</div>
                  </div>
                  <div className="text-[11px] text-slate-500">{item.role}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
