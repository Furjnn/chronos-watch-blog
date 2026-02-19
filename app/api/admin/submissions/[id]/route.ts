import { NextRequest, NextResponse } from "next/server";
import { PostStatus, SubmissionStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { notifyMemberSubmissionDecision } from "@/lib/notifications";
import { logAuditEvent } from "@/lib/audit-log";
import { getRequestContext } from "@/lib/request-context";
import { upsertPostSearchDocument } from "@/lib/search-index";
import { trackMetricEvent } from "@/lib/metrics";
import { notifyNewsletterPostPublished } from "@/lib/newsletter";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN", "EDITOR"]);
    const context = getRequestContext(req);
    const { id } = await params;
    const { action, reviewNote } = await req.json();

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, status: true, submittedByMemberId: true },
    });

    if (!existing || !existing.submittedByMemberId) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const now = new Date();
    const updated = await prisma.post.update({
      where: { id: existing.id },
      data: action === "approve"
        ? {
            approvalStatus: SubmissionStatus.APPROVED,
            status: PostStatus.PUBLISHED,
            reviewNote: String(reviewNote || "").trim() || null,
            reviewedAt: now,
            publishedAt: now,
          }
        : {
            approvalStatus: SubmissionStatus.REJECTED,
            status: PostStatus.DRAFT,
            reviewNote: String(reviewNote || "").trim() || null,
            reviewedAt: now,
          },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        reviewNote: true,
        status: true,
        approvalStatus: true,
        reviewedAt: true,
        submittedByMember: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (action === "approve") {
      await upsertPostSearchDocument(updated.id);
      await trackMetricEvent({
        type: "MEMBER_POST_APPROVED",
        postId: updated.id,
        path: req.nextUrl.pathname,
        metadata: { moderatorRole: session.role },
      });

      if (existing.status !== PostStatus.PUBLISHED && updated.status === PostStatus.PUBLISHED) {
        await notifyNewsletterPostPublished({
          postId: updated.id,
          title: updated.title,
          slug: updated.slug,
        });
      }
    }

    if (updated.submittedByMember) {
      await notifyMemberSubmissionDecision({
        memberId: updated.submittedByMember.id,
        memberEmail: updated.submittedByMember.email,
        memberName: updated.submittedByMember.name,
        postId: updated.id,
        postTitle: updated.title,
        status: updated.approvalStatus,
        reviewNote: updated.reviewNote,
      });
    }

    await logAuditEvent({
      action: action === "approve" ? "submission.approved" : "submission.rejected",
      entityType: "post",
      entityId: updated.id,
      summary: `${action === "approve" ? "Approved" : "Rejected"} submission: ${updated.title}`,
      actor: { userId: session.id },
      details: { reviewNote: updated.reviewNote || null },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return NextResponse.json({ submission: updated });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Bad request") },
      { status: getErrorStatus(error, 400) },
    );
  }
}
