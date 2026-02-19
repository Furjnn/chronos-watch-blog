import { prisma } from "@/lib/prisma";

interface RevisionActor {
  userId?: string | null;
  memberId?: string | null;
}

interface CreatePostRevisionInput {
  postId: string;
  snapshot: unknown;
  reason?: string | null;
  actor?: RevisionActor;
}

interface CreateReviewRevisionInput {
  reviewId: string;
  snapshot: unknown;
  reason?: string | null;
  actor?: RevisionActor;
}

export async function createPostRevision(input: CreatePostRevisionInput) {
  const latest = await prisma.postRevision.aggregate({
    where: { postId: input.postId },
    _max: { version: true },
  });

  return prisma.postRevision.create({
    data: {
      postId: input.postId,
      version: (latest._max.version || 0) + 1,
      snapshot: input.snapshot as object,
      reason: input.reason || null,
      createdByUserId: input.actor?.userId || null,
      createdByMemberId: input.actor?.memberId || null,
    },
    select: {
      id: true,
      version: true,
      createdAt: true,
    },
  });
}

export async function createReviewRevision(input: CreateReviewRevisionInput) {
  const latest = await prisma.reviewRevision.aggregate({
    where: { reviewId: input.reviewId },
    _max: { version: true },
  });

  return prisma.reviewRevision.create({
    data: {
      reviewId: input.reviewId,
      version: (latest._max.version || 0) + 1,
      snapshot: input.snapshot as object,
      reason: input.reason || null,
      createdByUserId: input.actor?.userId || null,
      createdByMemberId: input.actor?.memberId || null,
    },
    select: {
      id: true,
      version: true,
      createdAt: true,
    },
  });
}
