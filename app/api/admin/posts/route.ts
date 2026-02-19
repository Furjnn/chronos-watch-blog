import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { Prisma, PostStatus } from "@prisma/client";
import { createPostRevision } from "@/lib/revisions";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { upsertPostSearchDocument } from "@/lib/search-index";
import { maybeRunScheduledPublishing } from "@/lib/scheduler";
import { notifyNewsletterPostPublished } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    await maybeRunScheduledPublishing();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where: Prisma.PostWhereInput = {};
    if (status && status !== "all") {
      const normalizedStatus = status.toUpperCase();
      const allowedStatuses: PostStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
      if (allowedStatuses.includes(normalizedStatus as PostStatus)) {
        where.status = normalizedStatus as PostStatus;
      }
    }
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where, take: limit, skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, status: true, featured: true, views: true, scheduledAt: true, publishedAt: true, createdAt: true, author: { select: { name: true } }, categories: { select: { name: true } } },
      }),
      prisma.post.count({ where }),
    ]);
    return NextResponse.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const context = getRequestContext(req);
    const data = await req.json();

    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const shouldSchedule = Boolean(scheduledAt && !Number.isNaN(scheduledAt.getTime()) && scheduledAt > new Date());
    const finalStatus: PostStatus = shouldSchedule ? "DRAFT" : (data.status || "DRAFT");

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        body: data.body || null,
        coverImage: data.coverImage || null,
        status: finalStatus,
        approvalStatus: "APPROVED",
        featured: data.featured || false,
        readingTime: data.readingTime || null,
        publishedAt: finalStatus === "PUBLISHED" ? new Date() : null,
        scheduledAt: shouldSchedule ? scheduledAt : null,
        scheduledById: shouldSchedule ? session.id : null,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        ogImage: data.ogImage || null,
        authorId: data.authorId,
        brandId: data.brandId || null,
        categories: data.categoryIds?.length ? { connect: data.categoryIds.map((id: string) => ({ id })) } : undefined,
        tags: data.tagIds?.length ? { connect: data.tagIds.map((id: string) => ({ id })) } : undefined,
      },
    });

    await createPostRevision({
      postId: post.id,
      reason: shouldSchedule ? "post_scheduled" : "post_created",
      actor: { userId: session.id },
      snapshot: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        status: post.status,
        scheduledAt: post.scheduledAt,
      },
    });

    await upsertPostSearchDocument(post.id);

    await logAuditEvent({
      action: shouldSchedule ? "post.scheduled" : "post.created",
      entityType: "post",
      entityId: post.id,
      summary: shouldSchedule ? `Scheduled post: ${post.title}` : `Created post: ${post.title}`,
      actor: { userId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      details: {
        status: post.status,
        scheduledAt: post.scheduledAt,
      },
    });

    if (post.status === "PUBLISHED") {
      await notifyNewsletterPostPublished({
        postId: post.id,
        title: post.title,
        slug: post.slug,
      });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


