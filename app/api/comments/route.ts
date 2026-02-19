import { NextRequest, NextResponse } from "next/server";
import { CommentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMemberSession } from "@/lib/member-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestContext, hashIpAddress } from "@/lib/request-context";
import { logAuditEvent } from "@/lib/audit-log";
import { trackMetricEvent } from "@/lib/metrics";
import { notifyEditorsNewComment } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const reviewId = searchParams.get("reviewId");

  if (!postId && !reviewId) {
    return NextResponse.json({ error: "postId or reviewId is required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      status: CommentStatus.APPROVED,
      postId: postId || undefined,
      reviewId: reviewId || undefined,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      authorName: true,
      member: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      authorName: comment.member?.name || comment.authorName || "Anonymous",
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { postId, reviewId, body, name, email } = await req.json();
    const context = getRequestContext(req);
    const rateLimit = checkRateLimit(`public-comment:${context.ipAddress || "unknown"}`, {
      windowMs: 15 * 60 * 1000,
      max: 10,
      blockDurationMs: 30 * 60 * 1000,
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        {
          error: "Too many comments submitted. Please try again later.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    if (!postId && !reviewId) {
      return NextResponse.json({ error: "postId or reviewId is required" }, { status: 400 });
    }

    const content = String(body || "").trim();
    if (content.length < 3 || content.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be between 3 and 2000 characters" },
        { status: 400 },
      );
    }

    const session = await getMemberSession();
    const authorName = session?.name || String(name || "").trim();
    const authorEmail = session?.email || String(email || "").trim().toLowerCase();

    if (!session && (!authorName || !authorEmail.includes("@"))) {
      return NextResponse.json(
        { error: "Name and a valid email are required for guest comments" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        body: content,
        status: CommentStatus.PENDING,
        postId: postId || null,
        reviewId: reviewId || null,
        memberId: session?.id || null,
        authorName,
        authorEmail,
        ipHash: hashIpAddress(context.ipAddress),
      },
      select: {
        id: true,
        body: true,
        status: true,
        createdAt: true,
        authorName: true,
        authorEmail: true,
        post: { select: { id: true, title: true } },
        review: { select: { id: true, title: true } },
      },
    });

    await logAuditEvent({
      action: "comment.submitted",
      entityType: "comment",
      entityId: comment.id,
      summary: "New comment submitted for moderation",
      actor: { memberId: session?.id || null },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      details: {
        postId: comment.post?.id || null,
        reviewId: comment.review?.id || null,
      },
    });

    await trackMetricEvent({
      type: "COMMENT_SUBMITTED",
      memberId: session?.id || null,
      postId: comment.post?.id || null,
      reviewId: comment.review?.id || null,
      path: req.nextUrl.pathname,
      referrer: req.headers.get("referer"),
      userAgent: context.userAgent,
    });

    await notifyEditorsNewComment({
      commentId: comment.id,
      body: comment.body,
      postTitle: comment.post?.title,
      reviewTitle: comment.review?.title,
      authorName: comment.authorName,
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          status: comment.status,
          createdAt: comment.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to submit comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
