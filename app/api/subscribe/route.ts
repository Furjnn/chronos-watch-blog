import { NextRequest, NextResponse } from "next/server";
import { trackMetricEvent } from "@/lib/metrics";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { subscribeToNewsletter } from "@/lib/newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const context = getRequestContext(req);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const rateLimit = checkRateLimit(`newsletter:${context.ipAddress || "unknown"}`, {
      windowMs: 10 * 60 * 1000,
      max: 8,
      blockDurationMs: 30 * 60 * 1000,
    });
    if (!rateLimit.ok) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await trackMetricEvent({
      type: "NEWSLETTER_SIGNUP",
      path: req.nextUrl.pathname,
      referrer: req.headers.get("referer"),
      userAgent: context.userAgent,
      metadata: { emailDomain: normalizedEmail.split("@")[1] || null },
    });

    const result = await subscribeToNewsletter({
      email: normalizedEmail,
      sourcePath: req.nextUrl.pathname,
      locale: req.headers.get("x-locale") || null,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed: !result.created,
      message: result.created
        ? "Subscribed successfully. New publications will be emailed to you."
        : "You are already subscribed.",
    });
  } catch (err) {
    console.error("[newsletter] error", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
