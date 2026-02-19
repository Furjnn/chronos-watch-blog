import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage, getErrorStatus } from "@/lib/api-error";
import { logAuditEvent } from "@/lib/audit-log";
import { getRequestContext } from "@/lib/request-context";
import { logSecurityEvent } from "@/lib/security-events";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const context = getRequestContext(req);
    const { id } = await params;
    const data = await req.json();

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const member = await prisma.member.update({
      where: { id },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        timeoutUntil: true,
        moderationReason: true,
        moderatedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logAuditEvent({
      action: "member.profile.updated",
      entityType: "member",
      entityId: member.id,
      summary: `Updated member profile: ${member.email}`,
      actor: { userId: session.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return NextResponse.json({ member });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }
    return NextResponse.json(
      { error: getErrorMessage(error, "Bad request") },
      { status: getErrorStatus(error, 400) },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const context = getRequestContext(req);
    const { id } = await params;
    const data = await req.json();

    const action = String(data.action || "").toLowerCase();
    const reason = String(data.reason || "").trim();
    const now = new Date();

    if (!["ban", "timeout", "activate"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "timeout") {
      const timeoutHours = Number(data.timeoutHours);
      if (!Number.isFinite(timeoutHours) || timeoutHours < 1 || timeoutHours > 24 * 30) {
        return NextResponse.json({ error: "Timeout must be between 1 and 720 hours" }, { status: 400 });
      }

      const timeoutUntil = new Date(now.getTime() + timeoutHours * 60 * 60 * 1000);
      const member = await prisma.member.update({
        where: { id },
        data: {
          status: "TIMEOUT",
          timeoutUntil,
          moderationReason: reason || null,
          moderatedAt: now,
        },
        select: {
          id: true,
          status: true,
          timeoutUntil: true,
          moderationReason: true,
          moderatedAt: true,
          updatedAt: true,
        },
      });
      await logAuditEvent({
        action: "member.timeout",
        entityType: "member",
        entityId: id,
        summary: `Member timeout applied for ${timeoutHours}h`,
        actor: { userId: session.id },
        details: { timeoutHours, reason: reason || null },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      await logSecurityEvent({
        type: "MEMBER_BLOCKED",
        success: true,
        actor: { memberId: id },
        message: "Member timed out by admin",
        metadata: { timeoutHours, moderatorId: session.id },
      });
      return NextResponse.json({ member });
    }

    if (action === "ban") {
      const member = await prisma.member.update({
        where: { id },
        data: {
          status: "BANNED",
          timeoutUntil: null,
          moderationReason: reason || null,
          moderatedAt: now,
        },
        select: {
          id: true,
          status: true,
          timeoutUntil: true,
          moderationReason: true,
          moderatedAt: true,
          updatedAt: true,
        },
      });
      await logAuditEvent({
        action: "member.banned",
        entityType: "member",
        entityId: id,
        summary: "Member banned",
        actor: { userId: session.id },
        details: { reason: reason || null },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      await logSecurityEvent({
        type: "MEMBER_BLOCKED",
        success: true,
        actor: { memberId: id },
        message: "Member banned by admin",
        metadata: { moderatorId: session.id },
      });
      return NextResponse.json({ member });
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        status: "ACTIVE",
        timeoutUntil: null,
        moderationReason: reason || null,
        moderatedAt: now,
      },
      select: {
        id: true,
        status: true,
        timeoutUntil: true,
        moderationReason: true,
        moderatedAt: true,
        updatedAt: true,
      },
    });
    await logAuditEvent({
      action: "member.activated",
      entityType: "member",
      entityId: id,
      summary: "Member re-activated",
      actor: { userId: session.id },
      details: { reason: reason || null },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return NextResponse.json({ member });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Bad request") },
      { status: getErrorStatus(error, 400) },
    );
  }
}
