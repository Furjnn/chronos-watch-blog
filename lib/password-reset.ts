import crypto from "crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  throw new Error("Missing AUTH_SECRET. Set AUTH_SECRET in your environment variables.");
}

const SECRET = new TextEncoder().encode(authSecret);
const RESET_PURPOSE = "password_reset";
const RESET_TTL_MINUTES = 30;

export type PasswordResetSubject = "ADMIN" | "MEMBER";

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function createPasswordStamp(passwordHash: string) {
  return crypto.createHash("sha256").update(passwordHash).digest("base64url").slice(0, 48);
}

async function createResetToken(input: {
  subjectType: PasswordResetSubject;
  userId: string;
  email: string;
  passwordHash: string;
  ttlMinutes?: number;
}) {
  const ttl = Math.max(5, Math.min(240, input.ttlMinutes || RESET_TTL_MINUTES));
  return new SignJWT({
    purpose: RESET_PURPOSE,
    subjectType: input.subjectType,
    email: input.email.toLowerCase(),
    passwordStamp: createPasswordStamp(input.passwordHash),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime(`${ttl}m`)
    .sign(SECRET);
}

export async function createAdminPasswordResetRequest(email: string) {
  const normalizedEmail = asNonEmptyString(email).toLowerCase();
  if (!normalizedEmail) return null;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, passwordHash: true, name: true },
  });
  if (!user) return null;

  const token = await createResetToken({
    subjectType: "ADMIN",
    userId: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
  });

  return { token, user };
}

export async function createMemberPasswordResetRequest(email: string) {
  const normalizedEmail = asNonEmptyString(email).toLowerCase();
  if (!normalizedEmail) return null;

  const member = await prisma.member.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, passwordHash: true, name: true },
  });
  if (!member) return null;

  const token = await createResetToken({
    subjectType: "MEMBER",
    userId: member.id,
    email: member.email,
    passwordHash: member.passwordHash,
  });

  return { token, member };
}

type VerifyResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; error: string };

export async function verifyPasswordResetToken(input: {
  token: string;
  subjectType: PasswordResetSubject;
}): Promise<VerifyResult> {
  const token = asNonEmptyString(input.token);
  if (!token) {
    return { ok: false, error: "Reset token is required." };
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const purpose = asNonEmptyString(payload.purpose);
    const subjectType = asNonEmptyString(payload.subjectType);
    const emailFromToken = asNonEmptyString(payload.email).toLowerCase();
    const passwordStampFromToken = asNonEmptyString(payload.passwordStamp);
    const subjectId = asNonEmptyString(payload.sub);

    if (
      purpose !== RESET_PURPOSE ||
      subjectType !== input.subjectType ||
      !emailFromToken ||
      !passwordStampFromToken ||
      !subjectId
    ) {
      return { ok: false, error: "Invalid reset token." };
    }

    if (input.subjectType === "ADMIN") {
      const user = await prisma.user.findUnique({
        where: { id: subjectId },
        select: { id: true, email: true, passwordHash: true },
      });
      if (!user) {
        return { ok: false, error: "Reset token is no longer valid." };
      }

      const expectedStamp = createPasswordStamp(user.passwordHash);
      if (user.email.toLowerCase() !== emailFromToken || expectedStamp !== passwordStampFromToken) {
        return { ok: false, error: "Reset token has expired." };
      }

      return { ok: true, userId: user.id, email: user.email };
    }

    const member = await prisma.member.findUnique({
      where: { id: subjectId },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!member) {
      return { ok: false, error: "Reset token is no longer valid." };
    }

    const expectedStamp = createPasswordStamp(member.passwordHash);
    if (member.email.toLowerCase() !== emailFromToken || expectedStamp !== passwordStampFromToken) {
      return { ok: false, error: "Reset token has expired." };
    }

    return { ok: true, userId: member.id, email: member.email };
  } catch {
    return { ok: false, error: "Reset token is invalid or expired." };
  }
}

export async function resetPasswordWithToken(input: {
  token: string;
  subjectType: PasswordResetSubject;
  newPassword: string;
}): Promise<VerifyResult> {
  const newPassword = asNonEmptyString(input.newPassword);
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const verified = await verifyPasswordResetToken({
    token: input.token,
    subjectType: input.subjectType,
  });
  if (!verified.ok) return verified;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  if (input.subjectType === "ADMIN") {
    await Promise.all([
      prisma.user.update({
        where: { id: verified.userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.adminLoginChallenge.updateMany({
        where: {
          email: verified.email.toLowerCase(),
          consumedAt: null,
        },
        data: { consumedAt: new Date() },
      }),
    ]);
  } else {
    await prisma.member.update({
      where: { id: verified.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  return verified;
}
