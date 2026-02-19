import { NextRequest, NextResponse } from "next/server";
import { Prisma, SubmissionStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { searchParams } = new URL(req.url);
    const statusParam = (searchParams.get("status") || "PENDING").toUpperCase();
    const allowedStatus = new Set<SubmissionStatus>(["PENDING", "APPROVED", "REJECTED"]);

    const where: Prisma.PostWhereInput = {
      submittedByMemberId: { not: null },
      approvalStatus: allowedStatus.has(statusParam as SubmissionStatus)
        ? (statusParam as SubmissionStatus)
        : undefined,
    };

    const submissions = await prisma.post.findMany({
      where,
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
        reviewedAt: true,
        publishedAt: true,
        submittedByMember: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ submissions });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Unauthorized") },
      { status: getErrorStatus(error, 401) },
    );
  }
}
