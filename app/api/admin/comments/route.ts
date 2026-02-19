import { NextRequest, NextResponse } from "next/server";
import { CommentStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

const ALLOWED_STATUS = new Set<CommentStatus>(["PENDING", "APPROVED", "REJECTED", "SPAM"]);

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "EDITOR"]);
    const { searchParams } = new URL(req.url);
    const statusParam = (searchParams.get("status") || "PENDING").toUpperCase();
    const status = ALLOWED_STATUS.has(statusParam as CommentStatus)
      ? (statusParam as CommentStatus)
      : undefined;

    const comments = await prisma.comment.findMany({
      where: {
        status,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        body: true,
        status: true,
        authorName: true,
        authorEmail: true,
        moderationNote: true,
        moderatedAt: true,
        createdAt: true,
        post: { select: { id: true, title: true, slug: true } },
        review: { select: { id: true, title: true, slug: true } },
        member: { select: { id: true, name: true, email: true } },
        moderatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      comments,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Unauthorized") },
      { status: getErrorStatus(error, 401) },
    );
  }
}
