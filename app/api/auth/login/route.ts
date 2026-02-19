// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminEmailChallenge, verifyAdminEmailChallenge } from "@/lib/admin-mfa";
import { sendNotificationEmail } from "@/lib/notifications";
import { getRequestContext } from "@/lib/request-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { isMailDeliveryConfigured } from "@/lib/mail-settings";
import { consumeAdminRecoveryCode } from "@/lib/admin-recovery";
import {
  isLockActive,
  logSecurityEvent,
  registerFailedAdminLogin,
  registerSuccessfulAdminLogin,
} from "@/lib/security-events";

export async function POST(req: NextRequest) {
  try {
    const { email, password, verificationCode, recoveryCode } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const context = getRequestContext(req);
    const rateLimitKey = `admin-login:${context.ipAddress || "unknown"}:${normalizedEmail || "unknown"}`;
    const rateLimit = checkRateLimit(rateLimitKey, {
      windowMs: 10 * 60 * 1000,
      max: 10,
      blockDurationMs: 15 * 60 * 1000,
    });

    if (!rateLimit.ok) {
      await logSecurityEvent({
        type: "LOGIN_RATE_LIMITED",
        success: false,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        message: "Too many login attempts",
      });
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (verificationCode || recoveryCode) {
      let userId: string | null = null;
      let mfaMessage = "Admin second-factor verification completed";

      if (recoveryCode) {
        const now = new Date();
        const activeChallenge = await prisma.adminLoginChallenge.findFirst({
          where: {
            email: normalizedEmail,
            consumedAt: null,
            expiresAt: { gt: now },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (!activeChallenge) {
          return NextResponse.json(
            {
              error:
                "Recovery code requires a recent password verification. Sign in with email and password first.",
            },
            { status: 401 },
          );
        }
        await prisma.adminLoginChallenge.update({
          where: { id: activeChallenge.id },
          data: { consumedAt: now },
        });

        const recoveryResult = await consumeAdminRecoveryCode({
          email: normalizedEmail,
          recoveryCode: String(recoveryCode || ""),
        });
        if (!recoveryResult.ok) {
          await logSecurityEvent({
            type: "MFA_FAILED",
            success: false,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            message: recoveryResult.error,
          });
          return NextResponse.json({ error: recoveryResult.error }, { status: 401 });
        }
        userId = recoveryResult.userId;
        mfaMessage = `Admin recovery code used (${recoveryResult.remainingCodes} remaining)`;
      } else {
        const challenge = await verifyAdminEmailChallenge({
          email: normalizedEmail,
          code: String(verificationCode || "").trim(),
        });
        if (!challenge.ok) {
          await logSecurityEvent({
            type: "MFA_FAILED",
            success: false,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            message: challenge.error,
          });
          return NextResponse.json({ error: challenge.error }, { status: 401 });
        }
        userId = challenge.userId;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await registerSuccessfulAdminLogin(user.id);
      await logSecurityEvent({
        type: "MFA_SUCCESS",
        success: true,
        actor: { userId: user.id },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        message: mfaMessage,
      });
      await logSecurityEvent({
        type: "LOGIN_SUCCESS",
        success: true,
        actor: { userId: user.id },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      const token = await signToken({ id: user.id, email: user.email, role: user.role });
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
      response.cookies.set("admin-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    if (!password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        twoFactorEnabled: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      await logSecurityEvent({
        type: "LOGIN_FAILED",
        success: false,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        message: "Unknown email",
        metadata: { email: normalizedEmail },
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (isLockActive(user.lockedUntil)) {
      await logSecurityEvent({
        type: "LOGIN_FAILED",
        success: false,
        actor: { userId: user.id },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        message: "Account temporarily locked",
      });
      return NextResponse.json(
        { error: "Account temporarily locked due to failed attempts. Please try later." },
        { status: 423 },
      );
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      const failed = await registerFailedAdminLogin(user.id);
      await logSecurityEvent({
        type: "LOGIN_FAILED",
        success: false,
        actor: { userId: user.id },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        message: failed.locked ? "Invalid credentials; account locked" : "Invalid credentials",
        metadata: { attempts: failed.attempts },
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.twoFactorEnabled) {
      const challenge = await createAdminEmailChallenge({
        userId: user.id,
        email: user.email,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      const emailConfigured = await isMailDeliveryConfigured();
      if (emailConfigured) {
        await sendNotificationEmail({
          type: "ADMIN_MFA_CHALLENGE",
          to: user.email,
          recipientUserId: user.id,
          subject: "Chronos admin verification code",
          text: `Your Chronos admin verification code is: ${challenge.code}\nThis code expires in 10 minutes.`,
          payload: {
            challengeId: challenge.challengeId,
            expiresAt: challenge.expiresAt.toISOString(),
          },
        });
      } else if (process.env.NODE_ENV === "production") {
        await logSecurityEvent({
          type: "MFA_FAILED",
          success: false,
          actor: { userId: user.id },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          message: "Two-factor email delivery is not configured",
        });
        return NextResponse.json(
          {
            error:
              "Two-factor email delivery is not configured. Contact an administrator to update email settings or disable 2FA for this account.",
          },
          { status: 503 },
        );
      }

      await logSecurityEvent({
        type: "MFA_CHALLENGE",
        success: true,
        actor: { userId: user.id },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        message: emailConfigured ? "MFA code sent by email" : "MFA code issued in development mode",
      });

      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        email: user.email,
        expiresAt: challenge.expiresAt.toISOString(),
        developmentCode:
          !emailConfigured && process.env.NODE_ENV !== "production"
            ? challenge.code
            : undefined,
      });
    }

    await registerSuccessfulAdminLogin(user.id);
    await logSecurityEvent({
      type: "LOGIN_SUCCESS",
      success: true,
      actor: { userId: user.id },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    const token = await signToken({ id: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
