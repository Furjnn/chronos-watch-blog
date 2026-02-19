import { NextRequest, NextResponse } from "next/server";
import { registerMember, setMemberCookie } from "@/lib/member-auth";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-events";
import { trackMetricEvent } from "@/lib/metrics";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const context = getRequestContext(req);
    const rateLimit = checkRateLimit(
      `member-register:${context.ipAddress || "unknown"}:${normalizedEmail || "unknown"}`,
      {
        windowMs: 15 * 60 * 1000,
        max: 8,
        blockDurationMs: 20 * 60 * 1000,
      },
    );
    if (!rateLimit.ok) {
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const result = await registerMember(String(name), String(email), String(password));
    if (!result) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    await logSecurityEvent({
      type: "MEMBER_LOGIN_SUCCESS",
      success: true,
      actor: { memberId: result.user.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      message: "Member registered and signed in",
    });
    await trackMetricEvent({
      type: "MEMBER_REGISTER",
      memberId: result.user.id,
      path: req.nextUrl.pathname,
      referrer: req.headers.get("referer"),
      userAgent: context.userAgent,
    });

    const response = NextResponse.json({ success: true, user: result.user });
    setMemberCookie(response, result.token);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
