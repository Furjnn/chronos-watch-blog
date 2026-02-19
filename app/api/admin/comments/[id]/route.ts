import { NextRequest, NextResponse } from "next/server";
import { CommentStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { getRequestContext } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { notifyCommentAuthorDecision } from "@/lib/notifications";
import { trackMetricEvent } from "@/lib/metrics";

const ALLOWED_ACTIONS: Record<string, CommentStatus> = {
  approve: "APPROVED",
  reject: "REJECTED",
  spam: "SPAM",
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const context = getRequestContext(req);
    const { id } = await params;
    const { action, note } = await req.json();
    const targetStatus = ALLOWED_ACTIONS[String(action || "").toLowerCase()];

    if (!targetStatus) {
      return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 });
    }

    const existing = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        body: true,
        status: true,
        authorName: true,
        authorEmail: true,
        member: { select: { id: true, name: true, email: true } },
        postId: true,
        reviewId: true,
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const moderatedAt = new Date();
    const updated = await prisma.comment.update({
      where: { id: existing.id },
      data: {
        status: targetStatus,
        moderationNote: String(note || "").trim() || null,
        moderatedAt,
        moderatedByUserId: session.id,
      },
      select: {
        id: true,
        status: true,
        moderationNote: true,
        moderatedAt: true,
      },
    });

    await prisma.commentModeration.create({
      data: {
        commentId: existing.id,
        status: targetStatus,
        note: String(note || "").trim() || null,
        actorUserId: session.id,
      },
    });

    await logAuditEvent({
      action: `comment.${targetStatus.toLowerCase()}`,
      entityType: "comment",
      entityId: existing.id,
      summary: `Comment moderation decision: ${targetStatus}`,
      actor: { userId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      details: { previousStatus: existing.status, note: String(note || "").trim() || null },
    });

    if (targetStatus === "APPROVED") {
      await trackMetricEvent({
        type: "COMMENT_APPROVED",
        postId: existing.postId,
        reviewId: existing.reviewId,
        path: req.nextUrl.pathname,
        metadata: { moderatorId: session.id },
      });
    }

    const recipientName = existing.member?.name || existing.authorName || "Reader";
    const recipientEmail = existing.member?.email || existing.authorEmail;
    if (recipientEmail) {
      await notifyCommentAuthorDecision({
        to: recipientEmail,
        name: recipientName,
        approved: targetStatus === "APPROVED",
        commentPreview: existing.body.slice(0, 320),
      });
    }

    return NextResponse.json({ comment: updated });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Bad request") },
      { status: getErrorStatus(error, 400) },
    );
  }
}
