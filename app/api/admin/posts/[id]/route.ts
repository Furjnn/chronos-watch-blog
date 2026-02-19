import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { createPostRevision } from "@/lib/revisions";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { removeSearchDocument, upsertPostSearchDocument } from "@/lib/search-index";
import { SearchDocumentType } from "@prisma/client";
import { notifyNewsletterPostPublished } from "@/lib/newsletter";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        categories: true,
        tags: true,
        brand: true,
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            version: true,
            reason: true,
            createdAt: true,
            createdByUser: { select: { name: true, email: true } },
            createdByMember: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Unauthorized") }, { status: getErrorStatus(error, 401) });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const context = getRequestContext(req);
    const { id } = await params;
    const data = await req.json();
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { status: true },
    });
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const shouldSchedule = Boolean(scheduledAt && !Number.isNaN(scheduledAt.getTime()) && scheduledAt > new Date());
    const finalStatus = shouldSchedule ? "DRAFT" : (data.status || "DRAFT");

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        body: data.body || null,
        coverImage: data.coverImage || null,
        status: finalStatus,
        approvalStatus: finalStatus === "PUBLISHED" ? "APPROVED" : undefined,
        featured: data.featured || false,
        readingTime: data.readingTime || null,
        publishedAt: finalStatus === "PUBLISHED" && !data.publishedAt ? new Date() : data.publishedAt,
        reviewedAt: finalStatus === "PUBLISHED" ? new Date() : undefined,
        scheduledAt: shouldSchedule ? scheduledAt : null,
        scheduledById: shouldSchedule ? session.id : null,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        ogImage: data.ogImage || null,
        authorId: data.authorId,
        brandId: data.brandId || null,
        categories: { set: (data.categoryIds || []).map((cid: string) => ({ id: cid })) },
        tags: { set: (data.tagIds || []).map((tid: string) => ({ id: tid })) },
      },
    });

    await createPostRevision({
      postId: post.id,
      reason: shouldSchedule ? "post_rescheduled" : "post_updated",
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
      action: shouldSchedule ? "post.rescheduled" : "post.updated",
      entityType: "post",
      entityId: post.id,
      summary: shouldSchedule ? `Rescheduled post: ${post.title}` : `Updated post: ${post.title}`,
      actor: { userId: session.id },
      details: {
        status: post.status,
        scheduledAt: post.scheduledAt,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    if (existing?.status !== "PUBLISHED" && post.status === "PUBLISHED") {
      await notifyNewsletterPostPublished({
        postId: post.id,
        title: post.title,
        slug: post.slug,
      });
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    await prisma.post.delete({ where: { id } });
    await removeSearchDocument(SearchDocumentType.POST, id);
    if (existing) {
      await logAuditEvent({
        action: "post.deleted",
        entityType: "post",
        entityId: existing.id,
        summary: `Deleted post: ${existing.title}`,
        actor: { userId: session.id },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


