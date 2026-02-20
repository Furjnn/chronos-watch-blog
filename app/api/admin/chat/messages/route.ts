import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_CHAT_CHANNEL,
  ADMIN_CHAT_FETCH_LIMIT,
  ADMIN_CHAT_MAX_MESSAGE_LENGTH,
  type AdminChatMessagePayload,
} from "@/lib/admin-chat";
import { createAblyRestClient, isAblyConfigured } from "@/lib/ably-server";

export const runtime = "nodejs";

function parseLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 50;
  return Math.max(1, Math.min(Math.round(parsed), ADMIN_CHAT_FETCH_LIMIT));
}

function normalizeContent(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, ADMIN_CHAT_MAX_MESSAGE_LENGTH);
}

function toMessagePayload(message: {
  id: string;
  content: string;
  senderUserId: string;
  createdAt: Date;
  sender: {
    name: string;
    avatar: string | null;
    role: string;
  };
}): AdminChatMessagePayload {
  return {
    id: message.id,
    content: message.content,
    senderUserId: message.senderUserId,
    senderName: message.sender.name,
    senderAvatar: message.sender.avatar || "",
    senderRole: message.sender.role,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);

    const limit = parseLimit(req.nextUrl.searchParams.get("limit"));
    const before = req.nextUrl.searchParams.get("before");
    const beforeDate = before ? new Date(before) : null;
    const hasBefore = beforeDate ? !Number.isNaN(beforeDate.getTime()) : false;

    const messages = await prisma.adminChatMessage.findMany({
      where: hasBefore ? { createdAt: { lt: beforeDate as Date } } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        sender: {
          select: {
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      items: messages.reverse().map(toMessagePayload),
      realtime: isAblyConfigured(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: number }).status) || 401
        : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const data = await req.json().catch(() => ({}));
    const content = normalizeContent(data?.content);

    if (!content) {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    const message = await prisma.adminChatMessage.create({
      data: {
        content,
        senderUserId: session.id,
      },
      include: {
        sender: {
          select: {
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    const payload = toMessagePayload(message);

    if (isAblyConfigured()) {
      try {
        const ably = createAblyRestClient();
        await ably.channels.get(ADMIN_CHAT_CHANNEL).publish("message.created", payload);
      } catch (publishError) {
        console.error("[admin-chat] failed to publish realtime message", publishError);
      }
    }

    return NextResponse.json({ message: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: number }).status) || 400
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
