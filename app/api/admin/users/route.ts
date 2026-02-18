import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireAuth, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLE_OPTIONS = new Set<Role>(["ADMIN", "EDITOR", "AUTHOR"]);

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 401
      : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const data = await req.json();

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const role = String(data.role || "EDITOR") as Role;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!ROLE_OPTIONS.has(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 400
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
