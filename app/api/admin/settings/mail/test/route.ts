import { NextRequest, NextResponse } from "next/server";
import { NotificationStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/notifications";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const body = await req.json();
    const recipient = normalizeEmail(body?.to);

    if (!recipient || !recipient.includes("@")) {
      return NextResponse.json({ error: "Valid recipient email is required." }, { status: 400 });
    }

    const result = await sendNotificationEmail({
      type: "ADMIN_MAIL_TEST",
      to: recipient,
      recipientUserId: session.id,
      subject: "Chronos mail configuration test",
      text: `This is a test email from Chronos admin settings.\nSent at: ${new Date().toISOString()}`,
      payload: {
        triggeredByUserId: session.id,
      },
    });

    if (result.status === NotificationStatus.SENT) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${recipient}.`,
      });
    }

    if (result.status === NotificationStatus.SKIPPED) {
      return NextResponse.json(
        {
          error: result.reason || "Mail provider is not configured.",
        },
        { status: 412 },
      );
    }

    return NextResponse.json(
      {
        error: result.reason || "Test email could not be delivered.",
      },
      { status: 502 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Unable to send test email") },
      { status: getErrorStatus(error, 500) },
    );
  }
}
