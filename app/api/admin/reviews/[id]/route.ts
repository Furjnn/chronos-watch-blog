import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { PostStatus, SearchDocumentType } from "@prisma/client";
import { createReviewRevision } from "@/lib/revisions";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { removeSearchDocument, upsertReviewSearchDocument } from "@/lib/search-index";
import { notifyNewsletterReviewPublished } from "@/lib/newsletter";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        brand: true,
        author: true,
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            version: true,
            reason: true,
            createdAt: true,
            createdByUser: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(review);
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
    const existing = await prisma.review.findUnique({
      where: { id },
      select: { status: true },
    });
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const shouldSchedule = Boolean(scheduledAt && !Number.isNaN(scheduledAt.getTime()) && scheduledAt > new Date());
    const finalStatus: PostStatus = shouldSchedule ? "DRAFT" : (data.status || "DRAFT");
    const review = await prisma.review.update({
      where: { id },
      data: {
        title: data.title, slug: data.slug, watchRef: data.watchRef, rating: data.rating,
        verdict: data.verdict, body: data.body, specs: data.specs, prosAndCons: data.prosAndCons,
        gallery: data.gallery, priceMin: data.priceMin, priceMax: data.priceMax,
        status: finalStatus,
        publishedAt: finalStatus === "PUBLISHED" && !data.publishedAt ? new Date() : data.publishedAt,
        scheduledAt: shouldSchedule ? scheduledAt : null,
        scheduledById: shouldSchedule ? session.id : null,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        authorId: data.authorId, brandId: data.brandId,
      },
    });

    await createReviewRevision({
      reviewId: review.id,
      reason: shouldSchedule ? "review_rescheduled" : "review_updated",
      actor: { userId: session.id },
      snapshot: {
        title: review.title,
        slug: review.slug,
        verdict: review.verdict,
        body: review.body,
        status: review.status,
        scheduledAt: review.scheduledAt,
      },
    });

    await upsertReviewSearchDocument(review.id);
    await logAuditEvent({
      action: shouldSchedule ? "review.rescheduled" : "review.updated",
      entityType: "review",
      entityId: review.id,
      summary: shouldSchedule ? `Rescheduled review: ${review.title}` : `Updated review: ${review.title}`,
      actor: { userId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    if (existing?.status !== "PUBLISHED" && review.status === "PUBLISHED") {
      await notifyNewsletterReviewPublished({
        reviewId: review.id,
        title: review.title,
        slug: review.slug,
      });
    }

    return NextResponse.json(review);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const { id } = await params;
    const existing = await prisma.review.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    await prisma.review.delete({ where: { id } });
    await removeSearchDocument(SearchDocumentType.REVIEW, id);
    if (existing) {
      await logAuditEvent({
        action: "review.deleted",
        entityType: "review",
        entityId: existing.id,
        summary: `Deleted review: ${existing.title}`,
        actor: { userId: session.id },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


