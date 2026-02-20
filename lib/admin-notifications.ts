import { NotificationChannel, NotificationStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/notifications";
import { absoluteUrl } from "@/lib/seo";

const ADMIN_NOTIFICATION_CHANNEL = NotificationChannel.IN_APP;
const ADMIN_NOTIFICATION_UNREAD_STATUS = NotificationStatus.PENDING;
const ADMIN_NOTIFICATION_READ_STATUS = NotificationStatus.SENT;

export type AdminNotificationSeverity = "info" | "success" | "warning" | "critical";

export type AdminNotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  severity: AdminNotificationSeverity;
  unread: boolean;
  createdAt: string;
  postId: string | null;
  reviewId: string | null;
  commentId: string | null;
  details: unknown;
};

type NotificationPayloadObject = {
  message?: unknown;
  href?: unknown;
  severity?: unknown;
  details?: unknown;
};

const ADMIN_NOTIFICATION_SELECT = {
  id: true,
  type: true,
  subject: true,
  payload: true,
  status: true,
  createdAt: true,
  postId: true,
  reviewId: true,
  commentId: true,
} as const;

type AdminNotificationRow = Prisma.NotificationLogGetPayload<{
  select: typeof ADMIN_NOTIFICATION_SELECT;
}>;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSeverity(value: unknown): AdminNotificationSeverity {
  const normalized = asString(value).toLowerCase();
  if (normalized === "success") return "success";
  if (normalized === "warning") return "warning";
  if (normalized === "critical") return "critical";
  return "info";
}

function toPayload(value: Prisma.JsonValue | null): NotificationPayloadObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as NotificationPayloadObject;
}

function inferFallbackHref(row: Pick<AdminNotificationRow, "postId" | "reviewId" | "commentId">) {
  if (row.postId) return `/admin/posts/${row.postId}/edit`;
  if (row.reviewId) return `/admin/reviews/${row.reviewId}/edit`;
  if (row.commentId) return "/admin/comments";
  return "/admin/notifications";
}

function toAdminNotificationItem(row: AdminNotificationRow): AdminNotificationItem {
  const payload = toPayload(row.payload);
  const title = asString(row.subject) || "Notification";
  const message = asString(payload.message) || title;
  const href = asString(payload.href) || inferFallbackHref(row);
  const payloadRecord = payload as Record<string, unknown>;
  const detailsFromPayload = payloadRecord.details;
  const extraDetails = Object.fromEntries(
    Object.entries(payloadRecord).filter(([key]) => !["message", "href", "severity", "details"].includes(key)),
  );
  const details =
    detailsFromPayload !== undefined
      ? detailsFromPayload
      : Object.keys(extraDetails).length > 0
        ? extraDetails
        : null;

  return {
    id: row.id,
    type: row.type,
    title,
    message,
    href,
    severity: normalizeSeverity(payload.severity),
    unread: row.status === ADMIN_NOTIFICATION_UNREAD_STATUS,
    createdAt: row.createdAt.toISOString(),
    postId: row.postId,
    reviewId: row.reviewId,
    commentId: row.commentId,
    details,
  };
}

export async function getAdminNotificationFeed(input: {
  userId: string;
  limit?: number;
  includeRead?: boolean;
}) {
  const take = Math.max(1, Math.min(input.limit ?? 10, 100));

  const whereBase: Prisma.NotificationLogWhereInput = {
    recipientUserId: input.userId,
    channel: ADMIN_NOTIFICATION_CHANNEL,
  };

  const [rows, unreadCount] = await Promise.all([
    prisma.notificationLog.findMany({
      where: input.includeRead === false
        ? {
            ...whereBase,
            status: ADMIN_NOTIFICATION_UNREAD_STATUS,
          }
        : whereBase,
      orderBy: { createdAt: "desc" },
      take,
      select: ADMIN_NOTIFICATION_SELECT,
    }),
    prisma.notificationLog.count({
      where: {
        ...whereBase,
        status: ADMIN_NOTIFICATION_UNREAD_STATUS,
      },
    }),
  ]);

  return {
    items: rows.map(toAdminNotificationItem),
    unreadCount,
  };
}

export async function markAdminNotificationsAsRead(input: {
  userId: string;
  ids?: string[];
}) {
  const ids = (input.ids || []).filter((value) => value.length > 0);
  const result = await prisma.notificationLog.updateMany({
    where: {
      recipientUserId: input.userId,
      channel: ADMIN_NOTIFICATION_CHANNEL,
      status: ADMIN_NOTIFICATION_UNREAD_STATUS,
      ...(ids.length > 0 ? { id: { in: ids } } : {}),
    },
    data: {
      status: ADMIN_NOTIFICATION_READ_STATUS,
      sentAt: new Date(),
    },
  });
  return result.count;
}

export type CreateAdminInAppNotificationInput = {
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  href?: string | null;
  severity?: AdminNotificationSeverity;
  payload?: Record<string, unknown> | null;
  postId?: string | null;
  reviewId?: string | null;
  commentId?: string | null;
  dedupeWindowMinutes?: number;
  dedupeByEntity?: boolean;
};

export async function createAdminInAppNotification(input: CreateAdminInAppNotificationInput) {
  const dedupeWindowMinutes = Number(input.dedupeWindowMinutes || 0);

  if (dedupeWindowMinutes > 0 || input.dedupeByEntity) {
    const dedupeWhere: Prisma.NotificationLogWhereInput = {
      recipientUserId: input.recipientUserId,
      channel: ADMIN_NOTIFICATION_CHANNEL,
      type: input.type,
      subject: input.title,
      ...(dedupeWindowMinutes > 0
        ? { createdAt: { gte: new Date(Date.now() - dedupeWindowMinutes * 60 * 1000) } }
        : {}),
      ...(input.dedupeByEntity
        ? {
            ...(input.postId ? { postId: input.postId } : {}),
            ...(input.reviewId ? { reviewId: input.reviewId } : {}),
            ...(input.commentId ? { commentId: input.commentId } : {}),
          }
        : {}),
    };

    const existing = await prisma.notificationLog.findFirst({
      where: dedupeWhere,
      select: { id: true },
    });

    if (existing) {
      return { created: false, id: existing.id };
    }
  }

  const payload = {
    message: input.message,
    href: input.href || null,
    severity: input.severity || "info",
    ...(input.payload || {}),
  };

  const created = await prisma.notificationLog.create({
    data: {
      type: input.type,
      channel: ADMIN_NOTIFICATION_CHANNEL,
      status: ADMIN_NOTIFICATION_UNREAD_STATUS,
      recipientUserId: input.recipientUserId,
      subject: input.title,
      payload: payload as unknown as Prisma.InputJsonValue,
      postId: input.postId || null,
      reviewId: input.reviewId || null,
      commentId: input.commentId || null,
    },
    select: { id: true },
  });

  return { created: true, id: created.id };
}

export type NotifyAdminsInput = {
  type: string;
  title: string;
  message: string;
  href?: string | null;
  severity?: AdminNotificationSeverity;
  payload?: Record<string, unknown> | null;
  postId?: string | null;
  reviewId?: string | null;
  commentId?: string | null;
  sendEmail?: boolean;
  emailSubject?: string;
  emailText?: string;
  emailHtml?: string;
  roles?: Role[];
  dedupeWindowMinutes?: number;
  dedupeByEntity?: boolean;
};

export async function notifyAdminUsers(input: NotifyAdminsInput) {
  const targetRoles: Role[] =
    input.roles && input.roles.length > 0 ? input.roles : ["ADMIN", "EDITOR"];

  const recipients = await prisma.user.findMany({
    where: {
      role: {
        in: targetRoles,
      },
    },
    select: { id: true, email: true, name: true },
  });

  const href = input.href || "/admin/notifications";
  const mailSubject = input.emailSubject || `[Chronos Admin] ${input.title}`;
  const shouldSendEmail = input.sendEmail !== false;

  const results = await Promise.all(
    recipients.map(async (user) => {
      const inApp = await createAdminInAppNotification({
        recipientUserId: user.id,
        type: input.type,
        title: input.title,
        message: input.message,
        href,
        severity: input.severity || "info",
        payload: input.payload,
        postId: input.postId || null,
        reviewId: input.reviewId || null,
        commentId: input.commentId || null,
        dedupeWindowMinutes: input.dedupeWindowMinutes,
        dedupeByEntity: input.dedupeByEntity,
      });

      if (!shouldSendEmail || !inApp.created) {
        return { inAppCreated: inApp.created, emailed: false };
      }

      const result = await sendNotificationEmail({
        type: input.type,
        to: user.email,
        recipientUserId: user.id,
        postId: input.postId || null,
        reviewId: input.reviewId || null,
        commentId: input.commentId || null,
        subject: mailSubject,
        text:
          input.emailText ||
          `Hi ${user.name},\n\n${input.message}\n\nOpen admin: ${absoluteUrl(href)}`,
        html: input.emailHtml,
        payload: {
          message: input.message,
          href,
          severity: input.severity || "info",
          ...(input.payload || {}),
        },
      });

      return {
        inAppCreated: inApp.created,
        emailed: result.status === NotificationStatus.SENT,
      };
    }),
  );

  return {
    recipients: recipients.length,
    inAppCreated: results.filter((item) => item.inAppCreated).length,
    emailed: results.filter((item) => item.emailed).length,
  };
}
