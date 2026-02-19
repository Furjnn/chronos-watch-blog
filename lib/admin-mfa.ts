import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const CODE_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;

function generateSixDigitCode() {
  const value = crypto.randomInt(0, 1_000_000);
  return value.toString().padStart(6, "0");
}

export async function createAdminEmailChallenge(input: {
  userId: string;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 10);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.adminLoginChallenge.updateMany({
    where: {
      email: input.email.toLowerCase(),
      consumedAt: null,
    },
    data: { consumedAt: now },
  });

  const challenge = await prisma.adminLoginChallenge.create({
    data: {
      email: input.email.toLowerCase(),
      codeHash,
      expiresAt,
      userId: input.userId,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  return {
    challengeId: challenge.id,
    code,
    expiresAt: challenge.expiresAt,
  };
}

export async function verifyAdminEmailChallenge(input: {
  email: string;
  code: string;
}) {
  const now = new Date();
  const challenge = await prisma.adminLoginChallenge.findFirst({
    where: {
      email: input.email.toLowerCase(),
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      codeHash: true,
      expiresAt: true,
      attempts: true,
      userId: true,
    },
  });

  if (!challenge) {
    return { ok: false as const, error: "Verification challenge not found" };
  }
  if (challenge.expiresAt <= now) {
    await prisma.adminLoginChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: now },
    });
    return { ok: false as const, error: "Verification code expired" };
  }
  if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
    await prisma.adminLoginChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: now },
    });
    return { ok: false as const, error: "Too many verification attempts" };
  }

  const valid = await bcrypt.compare(input.code, challenge.codeHash);
  if (!valid) {
    const nextAttempts = challenge.attempts + 1;
    await prisma.adminLoginChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: nextAttempts,
        consumedAt: nextAttempts >= MAX_VERIFY_ATTEMPTS ? now : null,
      },
    });
    return { ok: false as const, error: "Invalid verification code" };
  }

  await prisma.adminLoginChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: now },
  });

  if (!challenge.userId) {
    return { ok: false as const, error: "Challenge is not linked to a user" };
  }

  return { ok: true as const, userId: challenge.userId };
}
