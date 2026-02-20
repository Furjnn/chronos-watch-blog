import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAdminNotificationFeed, markAdminNotificationsAsRead } from "@/lib/admin-notifications";

function parseLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 10;
  return Math.max(1, Math.min(Math.round(parsed), 100));
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const limit = parseLimit(req.nextUrl.searchParams.get("limit"));
    const unreadOnly = req.nextUrl.searchParams.get("unreadOnly") === "1";

    const feed = await getAdminNotificationFeed({
      userId: session.id,
      limit,
      includeRead: !unreadOnly,
    });

    return NextResponse.json(feed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 401
      : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((value: unknown) => typeof value === "string").map((value: string) => value.trim())
      : [];

    if (!body?.all && ids.length === 0) {
      return NextResponse.json({ error: "Notification ids are required unless all=true." }, { status: 400 });
    }

    const updated = await markAdminNotificationsAsRead({
      userId: session.id,
      ids: body?.all ? [] : ids,
    });

    const feed = await getAdminNotificationFeed({
      userId: session.id,
      limit: 12,
      includeRead: true,
    });

    return NextResponse.json({
      updated,
      ...feed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 400
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
