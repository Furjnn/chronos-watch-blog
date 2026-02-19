import { NextRequest, NextResponse } from "next/server";
import { PostStatus, SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MemberAuthError, requireMemberSession } from "@/lib/member-auth";
import { normalizeSubmissionBody, extractSubmissionText } from "@/lib/member-posts";
import { createPostRevision } from "@/lib/revisions";
import { logAuditEvent } from "@/lib/audit-log";
import { getRequestContext } from "@/lib/request-context";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireMemberSession();
    const context = getRequestContext(req);
    const { id } = await params;
    const existing = await prisma.post.findFirst({
      where: { id, submittedByMemberId: session.id },
      select: { id: true, approvalStatus: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing.approvalStatus === SubmissionStatus.APPROVED) {
      return NextResponse.json({ error: "Approved posts cannot be edited from member panel" }, { status: 400 });
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

    const post = await prisma.post.update({
      where: { id: existing.id },
      data: {
        title: String(title).trim(),
        excerpt: String(excerpt || "").trim() || null,
        body,
        status: PostStatus.DRAFT,
        approvalStatus: SubmissionStatus.PENDING,
        reviewNote: null,
        reviewedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        approvalStatus: true,
        updatedAt: true,
      },
    });

    await createPostRevision({
      postId: post.id,
      reason: "member_submission_updated",
      actor: { memberId: session.id },
      snapshot: {
        title: post.title,
        excerpt: String(excerpt || "").trim() || null,
        body,
        status: post.status,
        approvalStatus: post.approvalStatus,
      },
    });

    await logAuditEvent({
      action: "member.submission.updated",
      entityType: "post",
      entityId: post.id,
      summary: `Member submission updated: ${post.title}`,
      actor: { memberId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return NextResponse.json({ post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to update post";
    const status = error instanceof MemberAuthError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
