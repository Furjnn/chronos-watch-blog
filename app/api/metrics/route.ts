import { MetricEventType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { trackMetricEvent } from "@/lib/metrics";
import { getRequestContext } from "@/lib/request-context";
import { getMemberSession } from "@/lib/member-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = new Set<MetricEventType>([
  "PAGE_VIEW",
  "SEARCH_QUERY",
  "NEWSLETTER_SIGNUP",
  "MEMBER_REGISTER",
  "MEMBER_LOGIN",
  "MEMBER_POST_SUBMITTED",
  "MEMBER_POST_APPROVED",
  "COMMENT_SUBMITTED",
  "COMMENT_APPROVED",
]);

export async function POST(req: NextRequest) {
  try {
    const context = getRequestContext(req);
    const rateLimit = checkRateLimit(`metric:${context.ipAddress || "unknown"}`, {
      windowMs: 60 * 1000,
      max: 120,
      blockDurationMs: 5 * 60 * 1000,
    });
    if (!rateLimit.ok) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = await req.json();
    const type = String(body.type || "").toUpperCase() as MetricEventType;
    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid metric type" }, { status: 400 });
    }

    const memberSession = await getMemberSession();
    await trackMetricEvent({
      type,
      sessionId: body.sessionId ? String(body.sessionId) : null,
      path: body.path ? String(body.path) : req.nextUrl.pathname,
      locale: body.locale ? String(body.locale) : null,
      referrer: body.referrer ? String(body.referrer) : req.headers.get("referer"),
      userAgent: context.userAgent,
      country: body.country ? String(body.country) : null,
      memberId: memberSession?.id || null,
      postId: body.postId ? String(body.postId) : null,
      reviewId: body.reviewId ? String(body.reviewId) : null,
      metadata: body.metadata || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
