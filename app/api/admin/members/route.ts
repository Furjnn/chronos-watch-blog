import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        timeoutUntil: true,
        moderationReason: true,
        moderatedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({ members });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Unauthorized") },
      { status: getErrorStatus(error, 401) },
    );
  }
}
