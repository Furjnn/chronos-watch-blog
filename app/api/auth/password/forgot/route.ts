import { NextRequest, NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminPasswordResetRequest } from "@/lib/password-reset";
import { sendNotificationEmail } from "@/lib/notifications";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const context = getRequestContext(req);

    const rateLimit = checkRateLimit(
      `admin-password-forgot:${context.ipAddress || "unknown"}:${normalizedEmail || "unknown"}`,
      {
        windowMs: 10 * 60 * 1000,
        max: 8,
        blockDurationMs: 15 * 60 * 1000,
      },
    );
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429 },
      );
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const resetRequest = await createAdminPasswordResetRequest(normalizedEmail);
    if (resetRequest) {
      const resetLink = absoluteUrl(
        `/admin/login/reset-password?token=${encodeURIComponent(resetRequest.token)}`,
      );
      await sendNotificationEmail({
        type: "ADMIN_PASSWORD_RESET",
        to: resetRequest.user.email,
        recipientUserId: resetRequest.user.id,
        subject: "Chronos admin password reset",
        text: `Hi ${resetRequest.user.name},\n\nUse the link below to reset your password. This link expires in 30 minutes.\n\n${resetLink}\n\nIf you did not request this, you can ignore this email.`,
        payload: { resetLink },
      });
    }

    return NextResponse.json({ success: true, message: GENERIC_SUCCESS_MESSAGE });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
