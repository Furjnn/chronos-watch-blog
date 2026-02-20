import { prisma } from "@/lib/prisma";
import { notifyAdminUsers } from "@/lib/admin-notifications";

type SystemMonitorState = {
  running: boolean;
  lastRunAt: number;
};

type SystemMonitorSummary = {
  overdueScheduledPosts: number;
  overdueScheduledReviews: number;
  failedEmailsLastHour: number;
  failedAdminLoginsLastHour: number;
  rateLimitedLoginsLastHour: number;
  lockedAdmins: number;
  riskyAuditActionsLastDay: number;
  alertsTriggered: number;
};

const globalSystemMonitor = globalThis as unknown as {
  __chronosSystemMonitorState?: SystemMonitorState;
};

const monitorState =
  globalSystemMonitor.__chronosSystemMonitorState ||
  {
    running: false,
    lastRunAt: 0,
  };

if (!globalSystemMonitor.__chronosSystemMonitorState) {
  globalSystemMonitor.__chronosSystemMonitorState = monitorState;
}

export async function runSystemHealthMonitor() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const schedulerDelayThreshold = new Date(now.getTime() - 15 * 60 * 1000);

  const [
    overdueScheduledPosts,
    overdueScheduledReviews,
    failedEmailsLastHour,
    failedAdminLoginsLastHour,
    rateLimitedLoginsLastHour,
    lockedAdmins,
    riskyAuditActionsLastDay,
  ] = await Promise.all([
    prisma.post.count({
      where: {
        status: "DRAFT",
        scheduledAt: { lte: schedulerDelayThreshold },
      },
    }),
    prisma.review.count({
      where: {
        status: "DRAFT",
        scheduledAt: { lte: schedulerDelayThreshold },
      },
    }),
    prisma.notificationLog.count({
      where: {
        channel: "EMAIL",
        status: "FAILED",
        createdAt: { gte: oneHourAgo },
      },
    }),
    prisma.securityEvent.count({
      where: {
        type: "LOGIN_FAILED",
        success: false,
        createdAt: { gte: oneHourAgo },
      },
    }),
    prisma.securityEvent.count({
      where: {
        type: { in: ["LOGIN_RATE_LIMITED", "MEMBER_LOGIN_RATE_LIMITED"] },
        createdAt: { gte: oneHourAgo },
      },
    }),
    prisma.user.count({
      where: {
        lockedUntil: { gt: now },
      },
    }),
    prisma.auditLog.count({
      where: {
        action: { in: ["admin_user.deleted", "member.banned", "member.timeout"] },
        createdAt: { gte: oneDayAgo },
      },
    }),
  ]);

  let alertsTriggered = 0;
  const overdueTotal = overdueScheduledPosts + overdueScheduledReviews;

  if (overdueTotal > 0) {
    alertsTriggered += 1;
    await notifyAdminUsers({
      type: "SYSTEM_SCHEDULER_BACKLOG",
      title: "Scheduler backlog detected",
      message: `${overdueTotal} scheduled items are overdue (${overdueScheduledPosts} posts, ${overdueScheduledReviews} reviews).`,
      href: "/admin/scheduler",
      severity: "warning",
      dedupeWindowMinutes: 45,
      payload: {
        overdueScheduledPosts,
        overdueScheduledReviews,
      },
    });
  }

  if (failedEmailsLastHour >= 3) {
    alertsTriggered += 1;
    await notifyAdminUsers({
      type: "SYSTEM_MAIL_DELIVERY_ISSUE",
      title: "Mail delivery failures detected",
      message: `${failedEmailsLastHour} admin/system emails failed in the last hour.`,
      href: "/admin/settings",
      severity: "warning",
      dedupeWindowMinutes: 60,
      payload: {
        failedEmailsLastHour,
      },
    });
  }

  if (failedAdminLoginsLastHour >= 10 || rateLimitedLoginsLastHour >= 4 || lockedAdmins > 0) {
    alertsTriggered += 1;
    await notifyAdminUsers({
      type: "SYSTEM_SECURITY_ANOMALY",
      title: "Security anomaly detected",
      message: `Login failures: ${failedAdminLoginsLastHour}, rate-limited logins: ${rateLimitedLoginsLastHour}, locked admin accounts: ${lockedAdmins}.`,
      href: "/admin/security",
      severity: "critical",
      dedupeWindowMinutes: 30,
      payload: {
        failedAdminLoginsLastHour,
        rateLimitedLoginsLastHour,
        lockedAdmins,
      },
    });
  }

  if (riskyAuditActionsLastDay > 0) {
    alertsTriggered += 1;
    await notifyAdminUsers({
      type: "SYSTEM_RISKY_AUDIT_ACTIVITY",
      title: "Risky admin activity found",
      message: `${riskyAuditActionsLastDay} high-risk audit action(s) recorded in the last 24 hours.`,
      href: "/admin/audit",
      severity: "warning",
      dedupeWindowMinutes: 180,
      payload: {
        riskyAuditActionsLastDay,
      },
    });
  }

  return {
    overdueScheduledPosts,
    overdueScheduledReviews,
    failedEmailsLastHour,
    failedAdminLoginsLastHour,
    rateLimitedLoginsLastHour,
    lockedAdmins,
    riskyAuditActionsLastDay,
    alertsTriggered,
  } satisfies SystemMonitorSummary;
}

export async function maybeRunSystemHealthMonitor(cooldownMs = 5 * 60 * 1000) {
  const now = Date.now();
  if (monitorState.running) {
    return { skipped: true, reason: "running" as const, summary: null };
  }
  if (now - monitorState.lastRunAt < cooldownMs) {
    return { skipped: true, reason: "cooldown" as const, summary: null };
  }

  monitorState.running = true;
  try {
    monitorState.lastRunAt = now;
    const summary = await runSystemHealthMonitor();
    return { skipped: false, reason: null, summary };
  } finally {
    monitorState.running = false;
  }
}
