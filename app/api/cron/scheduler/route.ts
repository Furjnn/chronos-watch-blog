import { NextRequest, NextResponse } from "next/server";
import { runScheduledPublishing } from "@/lib/scheduler";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";

function isAuthorizedCronRequest(req: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.SCHEDULER_CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  const headerToken = (req.headers.get("x-cron-secret") || "").trim();
  const queryToken = (req.nextUrl.searchParams.get("secret") || "").trim();

  return bearerToken === secret || headerToken === secret || queryToken === secret;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSchedulerWithRetry() {
  const maxAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await runScheduledPublishing();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(attempt * 250);
      }
    }
  }

  throw lastError;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(req)) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    const context = getRequestContext(req);
    const summary = await runSchedulerWithRetry();

    await logAuditEvent({
      action: "scheduler.cron.run",
      entityType: "system",
      summary: "Cron scheduler run completed",
      details: summary,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return NextResponse.json({
      success: true,
      summary,
      ranAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to run scheduler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
