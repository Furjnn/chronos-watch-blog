import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { resetPasswordWithToken } from "@/lib/password-reset";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    const context = getRequestContext(req);
    const rateLimit = checkRateLimit(`member-password-reset:${context.ipAddress || "unknown"}`, {
      windowMs: 10 * 60 * 1000,
      max: 12,
      blockDurationMs: 10 * 60 * 1000,
    });
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try again later.", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429 },
      );
    }

    const result = await resetPasswordWithToken({
      token: String(token || ""),
      subjectType: "MEMBER",
      newPassword: String(password || ""),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can sign in now.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to reset password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
