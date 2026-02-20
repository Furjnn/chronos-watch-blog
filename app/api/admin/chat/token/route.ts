import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createAblyRestClient, isAblyConfigured } from "@/lib/ably-server";
import { ADMIN_CHAT_CHANNEL } from "@/lib/admin-chat";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);

    if (!isAblyConfigured()) {
      return NextResponse.json(
        { error: "ABLY_API_KEY is not configured." },
        { status: 503 },
      );
    }

    const ably = createAblyRestClient();
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: `admin:${session.id}`,
      ttl: 60 * 60 * 1000,
      capability: JSON.stringify({
        [ADMIN_CHAT_CHANNEL]: ["publish", "subscribe", "presence"],
      }),
    });

    return NextResponse.json(tokenRequest);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: number }).status) || 401
        : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
