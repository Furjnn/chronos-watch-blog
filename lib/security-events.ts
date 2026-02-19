import { Prisma, SecurityEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SecurityActor = {
  userId?: string | null;
  memberId?: string | null;
};

type SecurityEventInput = {
  type: SecurityEventType;
  success?: boolean;
  message?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
  actor?: SecurityActor;
};

export async function logSecurityEvent(input: SecurityEventInput) {
  try {
    await prisma.securityEvent.create({
      data: {
        type: input.type,
        success: input.success ?? true,
        message: input.message || null,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        metadata:
          input.metadata === undefined
            ? undefined
            : (input.metadata as Prisma.InputJsonValue),
        userId: input.actor?.userId || null,
        memberId: input.actor?.memberId || null,
      },
    });
  } catch (error) {
    console.error("[security-events] unable to persist event", error);
  }
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export function isLockActive(lockedUntil: Date | null | undefined) {
  return Boolean(lockedUntil && lockedUntil > new Date());
}

export async function registerFailedAdminLogin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  });
  const attempts = (user?.failedLoginAttempts || 0) + 1;
  const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
    },
  });

  return {
    attempts,
    locked: shouldLock,
  };
}

export async function registerSuccessfulAdminLogin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

export async function registerFailedMemberLogin(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { failedLoginAttempts: true },
  });
  const attempts = (member?.failedLoginAttempts || 0) + 1;
  const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

  await prisma.member.update({
    where: { id: memberId },
    data: {
      failedLoginAttempts: attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
    },
  });

  return {
    attempts,
    locked: shouldLock,
  };
}

export async function registerSuccessfulMemberLogin(memberId: string) {
  await prisma.member.update({
    where: { id: memberId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}
