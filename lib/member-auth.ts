import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { MemberStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { isLockActive, registerFailedMemberLogin, registerSuccessfulMemberLogin } from "./security-events";

const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  throw new Error("Missing AUTH_SECRET. Set AUTH_SECRET in your environment variables.");
}

const SECRET = new TextEncoder().encode(authSecret);
const MEMBER_COOKIE = "member-token";

export type MemberSession = {
  id: string;
  email: string;
  name: string;
};

export class MemberAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type MemberAccessRow = {
  id: string;
  email: string;
  name: string;
  status: MemberStatus;
  timeoutUntil: Date | null;
};

async function signMemberToken(payload: MemberSession) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

async function verifyMemberToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id?: string };
  } catch {
    return null;
  }
}

function formatTimeoutDate(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function assertMemberAccess(member: MemberAccessRow, throwOnBlocked: boolean) {
  if (member.status === "BANNED") {
    if (throwOnBlocked) {
      throw new MemberAuthError("Your account is banned. Contact support for details.", 403);
    }
    return false;
  }

  if (member.status === "TIMEOUT") {
    if (member.timeoutUntil && member.timeoutUntil > new Date()) {
      if (throwOnBlocked) {
        throw new MemberAuthError(
          `Your account is suspended until ${formatTimeoutDate(member.timeoutUntil)}.`,
          403,
        );
      }
      return false;
    }
    if (throwOnBlocked) {
      throw new MemberAuthError("Your account is temporarily suspended.", 403);
    }
    return false;
  }

  return true;
}

async function normalizeMemberStatus(member: MemberAccessRow): Promise<MemberAccessRow> {
  if (member.status === "TIMEOUT" && member.timeoutUntil && member.timeoutUntil <= new Date()) {
    return prisma.member.update({
      where: { id: member.id },
      data: {
        status: "ACTIVE",
        timeoutUntil: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        timeoutUntil: true,
      },
    });
  }
  return member;
}

async function loadSessionMemberById(id: string, throwOnBlocked: boolean): Promise<MemberSession | null> {
  const memberRow = await prisma.member.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, status: true, timeoutUntil: true },
  });
  if (!memberRow) return null;

  const normalized = await normalizeMemberStatus(memberRow);
  const allowed = assertMemberAccess(normalized, throwOnBlocked);
  if (!allowed) return null;

  return {
    id: normalized.id,
    email: normalized.email,
    name: normalized.name,
  };
}

export async function getMemberSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyMemberToken(token);
  if (!payload?.id) return null;

  try {
    return await loadSessionMemberById(payload.id, false);
  } catch {
    return null;
  }
}

export async function requireMemberSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  if (!token) throw new MemberAuthError("Unauthorized", 401);

  const payload = await verifyMemberToken(token);
  if (!payload?.id) throw new MemberAuthError("Unauthorized", 401);

  const member = await loadSessionMemberById(payload.id, true);
  if (!member) throw new MemberAuthError("Unauthorized", 401);
  return member;
}

export async function loginMember(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const member = await prisma.member.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      status: true,
      timeoutUntil: true,
      lockedUntil: true,
    },
  });
  if (!member) return null;

  if (isLockActive(member.lockedUntil)) {
    throw new MemberAuthError("Too many failed attempts. Please try again later.", 423);
  }

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) {
    await registerFailedMemberLogin(member.id);
    return null;
  }

  await registerSuccessfulMemberLogin(member.id);

  const normalized = await normalizeMemberStatus({
    id: member.id,
    email: member.email,
    name: member.name,
    status: member.status,
    timeoutUntil: member.timeoutUntil,
  });
  assertMemberAccess(normalized, true);

  const user = { id: normalized.id, email: normalized.email, name: normalized.name };
  const token = await signMemberToken(user);
  return { token, user };
}

export async function registerMember(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.member.findUnique({ where: { email: normalizedEmail } });
  if (existing) return null;

  const passwordHash = await bcrypt.hash(password, 12);
  const member = await prisma.member.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  const user = { id: member.id, email: member.email, name: member.name };
  const token = await signMemberToken(user);
  return { token, user };
}

export function setMemberCookie(response: NextResponse, token: string) {
  response.cookies.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function clearMemberCookie(response: NextResponse) {
  response.cookies.set(MEMBER_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}
