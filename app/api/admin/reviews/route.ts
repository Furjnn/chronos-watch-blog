import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { createReviewRevision } from "@/lib/revisions";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { maybeRunScheduledPublishing } from "@/lib/scheduler";
import { upsertReviewSearchDocument } from "@/lib/search-index";
import { PostStatus } from "@prisma/client";
import { notifyNewsletterReviewPublished } from "@/lib/newsletter";

export async function GET() {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    await maybeRunScheduledPublishing();
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, watchRef: true, rating: true, status: true, views: true, createdAt: true, brand: { select: { name: true } }, author: { select: { name: true } } },
    });
    return NextResponse.json({ reviews });
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
    const review = await prisma.review.create({
      data: {
        title: data.title, slug, watchRef: data.watchRef, rating: data.rating,
        verdict: data.verdict || null, body: data.body || null,
        specs: data.specs || null, prosAndCons: data.prosAndCons || null,
        gallery: data.gallery || null,
        priceMin: data.priceMin || null, priceMax: data.priceMax || null,
        status: finalStatus,
        publishedAt: finalStatus === "PUBLISHED" ? new Date() : null,
        scheduledAt: shouldSchedule ? scheduledAt : null,
        scheduledById: shouldSchedule ? session.id : null,
        seoTitle: data.seoTitle || null, seoDesc: data.seoDesc || null,
        authorId: data.authorId, brandId: data.brandId,
      },
    });

    await createReviewRevision({
      reviewId: review.id,
      reason: shouldSchedule ? "review_scheduled" : "review_created",
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
      action: shouldSchedule ? "review.scheduled" : "review.created",
      entityType: "review",
      entityId: review.id,
      summary: shouldSchedule ? `Scheduled review: ${review.title}` : `Created review: ${review.title}`,
      actor: { userId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    if (review.status === "PUBLISHED") {
      await notifyNewsletterReviewPublished({
        reviewId: review.id,
        title: review.title,
        slug: review.slug,
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Bad request") }, { status: getErrorStatus(error, 400) });
  }
}


