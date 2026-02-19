import { NextRequest, NextResponse } from "next/server";
import { PostStatus, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MemberAuthError, requireMemberSession } from "@/lib/member-auth";
import {
  buildSubmissionSlug,
  ensureCommunityAuthor,
  normalizeSubmissionBody,
  extractSubmissionText,
} from "@/lib/member-posts";
import { createPostRevision } from "@/lib/revisions";
import { logAuditEvent } from "@/lib/audit-log";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { trackMetricEvent } from "@/lib/metrics";
import { notifyEditorsNewSubmission } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await requireMemberSession();
    const posts = await prisma.post.findMany({
      where: { submittedByMemberId: session.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        approvalStatus: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        views: true,
      },
    });

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = error instanceof MemberAuthError ? error.status : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireMemberSession();
    const context = getRequestContext(req);
    const rateLimit = checkRateLimit(`member-post-submit:${session.id}`, {
      windowMs: 60 * 60 * 1000,
      max: 6,
      blockDurationMs: 2 * 60 * 60 * 1000,
    });
    if (!rateLimit.ok) {
      return NextResponse.json(
        {
          error: "Submission limit reached. Please try again later.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    const { title, excerpt, content } = await req.json();

    if (!title || String(title).trim().length < 8) {
      return NextResponse.json({ error: "Title must be at least 8 characters" }, { status: 400 });
    }

    const body = normalizeSubmissionBody(content);
    const plainText = extractSubmissionText(body);
    if (!body || plainText.length < 50) {
      return NextResponse.json({ error: "Content must be at least 50 characters" }, { status: 400 });
    }

    const communityAuthor = await ensureCommunityAuthor();
    const post = await prisma.post.create({
      data: {
        title: String(title).trim(),
        slug: buildSubmissionSlug(String(title), session.id),
        excerpt: String(excerpt || "").trim() || null,
        body,
        status: PostStatus.DRAFT,
        approvalStatus: SubmissionStatus.PENDING,
        reviewNote: null,
        reviewedAt: null,
        authorId: communityAuthor.id,
        submittedByMemberId: session.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        approvalStatus: true,
        createdAt: true,
      },
    });

    await createPostRevision({
      postId: post.id,
      reason: "member_submission_created",
      actor: { memberId: session.id },
      snapshot: {
        title: post.title,
        excerpt: String(excerpt || "").trim() || null,
        body,
        status: PostStatus.DRAFT,
        approvalStatus: SubmissionStatus.PENDING,
      },
    });

    await logAuditEvent({
      action: "member.submission.created",
      entityType: "post",
      entityId: post.id,
      summary: `Member submission created: ${post.title}`,
      actor: { memberId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    await trackMetricEvent({
      type: "MEMBER_POST_SUBMITTED",
      memberId: session.id,
      postId: post.id,
      path: req.nextUrl.pathname,
      referrer: req.headers.get("referer"),
      userAgent: context.userAgent,
      metadata: { titleLength: String(title).trim().length },
    });

    await notifyEditorsNewSubmission({
      postId: post.id,
      postTitle: post.title,
      memberId: session.id,
      memberName: session.name,
      memberEmail: session.email,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to submit post";
    const status = error instanceof MemberAuthError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
