import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { runScheduledPublishing } from "@/lib/scheduler";
import { notifyAdminUsers } from "@/lib/admin-notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const context = getRequestContext(req);
    const summary = await runScheduledPublishing();

    await logAuditEvent({
      action: "scheduler.run",
      entityType: "system",
      summary: "Manual scheduler run completed",
      actor: { userId: session.id },
      details: summary,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to run scheduler";
    try {
      await notifyAdminUsers({
        type: "SYSTEM_SCHEDULER_MANUAL_FAILED",
        title: "Manual scheduler run failed",
        message: `Scheduler run failed from admin panel: ${message}`,
        href: "/admin/scheduler",
        severity: "critical",
        dedupeWindowMinutes: 20,
        emailSubject: "[Chronos Scheduler] Manual run failed",
        payload: {
          message,
        },
      });
    } catch (notifyError) {
      console.error("[admin:scheduler] failed to notify admins", notifyError);
    }
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 401
      : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
