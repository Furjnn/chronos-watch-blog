// lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  throw new Error("Missing AUTH_SECRET. Set AUTH_SECRET in your environment variables.");
}

const SECRET = new TextEncoder().encode(authSecret);

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function signToken(payload: { id: string; email: string; role: Role }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: string; email: string; role: Role };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(roles?: Role[]) {
  const session = await getSession();
  if (!session) throw new AuthError("Unauthorized", 401);
  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const token = await signToken({ id: user.id, email: user.email, role: user.role });
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
