import { PostStatus, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-log";
import { upsertPostSearchDocument, upsertReviewSearchDocument } from "@/lib/search-index";
import { notifyNewsletterPostPublished, notifyNewsletterReviewPublished } from "@/lib/newsletter";

type SchedulerSummary = {
  publishedPosts: number;
  publishedReviews: number;
};

type SchedulerState = {
  running: boolean;
  lastRunAt: number;
};

const globalScheduler = globalThis as unknown as {
  __chronosSchedulerState?: SchedulerState;
};

const schedulerState =
  globalScheduler.__chronosSchedulerState ||
  {
    running: false,
    lastRunAt: 0,
  };

if (!globalScheduler.__chronosSchedulerState) {
  globalScheduler.__chronosSchedulerState = schedulerState;
}

function isSchemaSyncError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  const code = String((error as { code?: unknown }).code || "");
  return code === "P2021" || code === "P2022";
}

export async function runScheduledPublishing() {
  try {
    const now = new Date();
    const [scheduledPosts, scheduledReviews] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: PostStatus.DRAFT,
          scheduledAt: { lte: now },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          scheduledAt: true,
        },
        take: 25,
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.review.findMany({
        where: {
          status: PostStatus.DRAFT,
          scheduledAt: { lte: now },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          scheduledAt: true,
        },
        take: 25,
        orderBy: { scheduledAt: "asc" },
      }),
    ]);

    let publishedPosts = 0;
    let publishedReviews = 0;

    for (const post of scheduledPosts) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: PostStatus.PUBLISHED,
          approvalStatus: SubmissionStatus.APPROVED,
          publishedAt: post.scheduledAt || now,
          reviewedAt: now,
          scheduledAt: null,
        },
      });
      publishedPosts += 1;
      await upsertPostSearchDocument(post.id);
      await notifyNewsletterPostPublished({
        postId: post.id,
        title: post.title,
        slug: post.slug,
      });
      await logAuditEvent({
        action: "post.scheduled_publish.executed",
        entityType: "post",
        entityId: post.id,
        summary: `Scheduled post published automatically: ${post.title}`,
      });
    }

    for (const review of scheduledReviews) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: review.scheduledAt || now,
          scheduledAt: null,
        },
      });
      publishedReviews += 1;
      await upsertReviewSearchDocument(review.id);
      await notifyNewsletterReviewPublished({
        reviewId: review.id,
        title: review.title,
        slug: review.slug,
      });
      await logAuditEvent({
        action: "review.scheduled_publish.executed",
        entityType: "review",
        entityId: review.id,
        summary: `Scheduled review published automatically: ${review.title}`,
      });
    }

    return { publishedPosts, publishedReviews } satisfies SchedulerSummary;
  } catch (error) {
    if (isSchemaSyncError(error)) {
      console.warn(
        "[scheduler] Skipped run because database schema is behind. Run `npx prisma db push && npx prisma generate` and restart dev server.",
      );
      return { publishedPosts: 0, publishedReviews: 0 } satisfies SchedulerSummary;
    }
    throw error;
  }
}

export async function maybeRunScheduledPublishing(cooldownMs = 30_000) {
  const now = Date.now();
  if (schedulerState.running) {
    return { skipped: true, reason: "running" as const, summary: null };
  }
  if (now - schedulerState.lastRunAt < cooldownMs) {
    return { skipped: true, reason: "cooldown" as const, summary: null };
  }

  schedulerState.running = true;
  try {
    schedulerState.lastRunAt = now;
    const summary = await runScheduledPublishing();
    return { skipped: false, reason: null, summary };
  } finally {
    schedulerState.running = false;
  }
}
