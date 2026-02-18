import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireAuth, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLE_OPTIONS = new Set<Role>(["ADMIN", "EDITOR", "AUTHOR"]);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const { id } = await params;
    const data = await req.json();

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const role = String(data.role || "EDITOR") as Role;
    const password = String(data.password || "");

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    if (!ROLE_OPTIONS.has(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (session.id === id && role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot remove your own ADMIN role" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 400
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const { id } = await params;

    if (session.id === id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last ADMIN user" }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status) || 400
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
