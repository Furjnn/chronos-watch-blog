import { NextRequest, NextResponse } from "next/server";
import { loginMember, MemberAuthError, setMemberCookie } from "@/lib/member-auth";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-events";
import { trackMetricEvent } from "@/lib/metrics";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const context = getRequestContext(req);

    const rateLimit = checkRateLimit(
      `member-login:${context.ipAddress || "unknown"}:${normalizedEmail || "unknown"}`,
      {
        windowMs: 10 * 60 * 1000,
        max: 12,
        blockDurationMs: 15 * 60 * 1000,
      },
    );
    if (!rateLimit.ok) {
      await logSecurityEvent({
        type: "MEMBER_LOGIN_RATE_LIMITED",
        success: false,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: { email: normalizedEmail, retryAfter: rateLimit.retryAfterSeconds },
      });
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await loginMember(String(email), String(password));
    if (!result) {
      await logSecurityEvent({
        type: "MEMBER_LOGIN_FAILED",
        success: false,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: { email: normalizedEmail },
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await logSecurityEvent({
      type: "MEMBER_LOGIN_SUCCESS",
      success: true,
      actor: { memberId: result.user.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    await trackMetricEvent({
      type: "MEMBER_LOGIN",
      memberId: result.user.id,
      path: req.nextUrl.pathname,
      referrer: req.headers.get("referer"),
      userAgent: context.userAgent,
    });

    const response = NextResponse.json({ success: true, user: result.user });
    setMemberCookie(response, result.token);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    const status = error instanceof MemberAuthError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
