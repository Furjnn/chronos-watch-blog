import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/notifications";
import { absoluteUrl } from "@/lib/seo";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { localizePathname } from "@/lib/i18n/routing";
import { logAuditEvent } from "@/lib/audit-log";

const NEWSLETTER_SUBSCRIPTION_TYPE = "NEWSLETTER_SUBSCRIBED";
const NEWSLETTER_POST_BROADCAST_ACTION = "newsletter.post.broadcasted";
const NEWSLETTER_REVIEW_BROADCAST_ACTION = "newsletter.review.broadcasted";
const MAX_NEWSLETTER_RECIPIENTS = 2000;
const EMAIL_BATCH_SIZE = 20;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return value.includes("@") && value.includes(".");
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

type NewsletterSubscribeResult =
  | { ok: true; created: true; email: string }
  | { ok: true; created: false; email: string }
  | { ok: false; error: string };

export async function subscribeToNewsletter(input: {
  email: string;
  sourcePath?: string | null;
  locale?: string | null;
}) : Promise<NewsletterSubscribeResult> {
  const email = normalizeEmail(input.email || "");
  if (!email || !isValidEmail(email)) {
    return { ok: false, error: "Valid email is required." };
  }

  const existing = await prisma.notificationLog.findFirst({
    where: {
      type: NEWSLETTER_SUBSCRIPTION_TYPE,
      recipientEmail: email,
    },
    select: { id: true },
  });
  if (existing) {
    return { ok: true, created: false, email };
  }

  await prisma.notificationLog.create({
    data: {
      type: NEWSLETTER_SUBSCRIPTION_TYPE,
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SENT,
      recipientEmail: email,
      subject: "Newsletter subscription",
      payload: {
        sourcePath: input.sourcePath || null,
        locale: input.locale || null,
      },
      sentAt: new Date(),
    },
  });

  return { ok: true, created: true, email };
}

async function listNewsletterRecipients() {
  const rows = await prisma.notificationLog.findMany({
    where: {
      type: NEWSLETTER_SUBSCRIPTION_TYPE,
      recipientEmail: { not: null },
    },
    distinct: ["recipientEmail"],
    select: { recipientEmail: true },
    take: MAX_NEWSLETTER_RECIPIENTS,
  });

  return rows
    .map((row) => normalizeEmail(row.recipientEmail || ""))
    .filter((email) => email.length > 0);
}

async function hasBroadcastAuditEntry(input: {
  action: string;
  entityType: string;
  entityId: string;
}) {
  const existing = await prisma.auditLog.findFirst({
    where: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function deliverNewsletterEmailBatch(input: {
  recipients: string[];
  type: string;
  subject: string;
  text: string;
  html?: string;
  postId?: string | null;
  reviewId?: string | null;
}) {
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  const batches = chunkArray(input.recipients, EMAIL_BATCH_SIZE);
  for (const batch of batches) {
    const results = await Promise.all(
      batch.map((recipientEmail) =>
        sendNotificationEmail({
          type: input.type,
          to: recipientEmail,
          subject: input.subject,
          text: input.text,
          html: input.html,
          postId: input.postId || null,
          reviewId: input.reviewId || null,
        }),
      ),
    );

    for (const result of results) {
      if (result.status === NotificationStatus.SENT) sent += 1;
      else if (result.status === NotificationStatus.SKIPPED) skipped += 1;
      else failed += 1;
    }
  }

  return { sent, failed, skipped };
}

export async function notifyNewsletterPostPublished(input: {
  postId: string;
  title: string;
  slug: string;
}) {
  if (!input.postId || !input.slug || !input.title) return;

  const alreadyBroadcasted = await hasBroadcastAuditEntry(
    {
      action: NEWSLETTER_POST_BROADCAST_ACTION,
      entityType: "post",
      entityId: input.postId,
    },
  );
  if (alreadyBroadcasted) return;

  const recipients = await listNewsletterRecipients();
  if (recipients.length === 0) return;

  const link = absoluteUrl(localizePathname(`/blog/${input.slug}`, DEFAULT_LOCALE));
  const subject = `New article on Chronos: ${input.title}`;
  const text = `A new article has been published on Chronos.\n\n${input.title}\n${link}`;

  const summary = await deliverNewsletterEmailBatch({
    recipients,
    type: "NEWSLETTER_POST_PUBLISHED",
    subject,
    text,
    postId: input.postId,
  });

  await logAuditEvent({
    action: NEWSLETTER_POST_BROADCAST_ACTION,
    entityType: "post",
    entityId: input.postId,
    summary: `Newsletter sent for post: ${input.title}`,
    details: {
      recipients: recipients.length,
      sent: summary.sent,
      failed: summary.failed,
      skipped: summary.skipped,
    },
  });
}

export async function notifyNewsletterReviewPublished(input: {
  reviewId: string;
  title: string;
  slug: string;
}) {
  if (!input.reviewId || !input.slug || !input.title) return;

  const alreadyBroadcasted = await hasBroadcastAuditEntry(
    {
      action: NEWSLETTER_REVIEW_BROADCAST_ACTION,
      entityType: "review",
      entityId: input.reviewId,
    },
  );
  if (alreadyBroadcasted) return;

  const recipients = await listNewsletterRecipients();
  if (recipients.length === 0) return;

  const link = absoluteUrl(localizePathname(`/reviews/${input.slug}`, DEFAULT_LOCALE));
  const subject = `New review on Chronos: ${input.title}`;
  const text = `A new review has been published on Chronos.\n\n${input.title}\n${link}`;

  const summary = await deliverNewsletterEmailBatch({
    recipients,
    type: "NEWSLETTER_REVIEW_PUBLISHED",
    subject,
    text,
    reviewId: input.reviewId,
  });

  await logAuditEvent({
    action: NEWSLETTER_REVIEW_BROADCAST_ACTION,
    entityType: "review",
    entityId: input.reviewId,
    summary: `Newsletter sent for review: ${input.title}`,
    details: {
      recipients: recipients.length,
      sent: summary.sent,
      failed: summary.failed,
      skipped: summary.skipped,
    },
  });
}
