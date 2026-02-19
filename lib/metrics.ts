import { MetricEventType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TrackMetricInput = {
  type: MetricEventType;
  sessionId?: string | null;
  path?: string | null;
  locale?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  country?: string | null;
  memberId?: string | null;
  postId?: string | null;
  reviewId?: string | null;
  metadata?: unknown;
};

export async function trackMetricEvent(input: TrackMetricInput) {
  try {
    await prisma.metricEvent.create({
      data: {
        type: input.type,
        sessionId: input.sessionId || null,
        path: input.path || null,
        locale: input.locale || null,
        referrer: input.referrer || null,
        userAgent: input.userAgent || null,
        country: input.country || null,
        memberId: input.memberId || null,
        postId: input.postId || null,
        reviewId: input.reviewId || null,
        metadata:
          input.metadata === undefined
            ? undefined
            : (input.metadata as Prisma.InputJsonValue),
      },
    });
  } catch (error) {
    console.error("[metrics] unable to write metric event", error);
  }
}
