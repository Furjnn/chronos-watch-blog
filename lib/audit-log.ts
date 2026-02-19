import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface AuditActor {
  userId?: string | null;
  memberId?: string | null;
}

export interface AuditDetails {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary?: string | null;
  details?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  actor?: AuditActor;
}

export async function logAuditEvent(input: AuditDetails) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        summary: input.summary || null,
        details:
          input.details === undefined
            ? undefined
            : (input.details as Prisma.InputJsonValue),
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        actorUserId: input.actor?.userId || null,
        actorMemberId: input.actor?.memberId || null,
      },
    });
  } catch (error) {
    // Audit logging must never break the request lifecycle.
    console.error("[audit-log] unable to persist event", error);
  }
}
