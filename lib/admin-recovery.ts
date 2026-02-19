import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_BYTE_SIZE = 5;

type ParsedRecoveryState = {
  backupCodeHashes: string[];
  legacySecret: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeRecoveryCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatRecoveryCode(value: string) {
  const normalized = normalizeRecoveryCode(value).slice(0, 10);
  if (normalized.length <= 5) return normalized;
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}

function parseRecoveryState(twoFactorSecret: string | null): ParsedRecoveryState {
  if (!isNonEmptyString(twoFactorSecret)) {
    return { backupCodeHashes: [], legacySecret: null };
  }

  const raw = twoFactorSecret.trim();
  if (!raw.startsWith("{")) {
    return {
      backupCodeHashes: [],
      legacySecret: raw,
    };
  }

  try {
    const payload = JSON.parse(raw) as {
      backupCodeHashes?: unknown;
      legacySecret?: unknown;
    };
    const backupCodeHashes = Array.isArray(payload.backupCodeHashes)
      ? payload.backupCodeHashes.filter(isNonEmptyString)
      : [];
    const legacySecret = isNonEmptyString(payload.legacySecret)
      ? payload.legacySecret
      : null;
    return { backupCodeHashes, legacySecret };
  } catch {
    return { backupCodeHashes: [], legacySecret: raw };
  }
}

function serializeRecoveryState(state: ParsedRecoveryState) {
  return JSON.stringify({
    backupCodeHashes: state.backupCodeHashes,
    legacySecret: state.legacySecret,
  });
}

function generateRecoveryCode() {
  const chars = crypto
    .randomBytes(RECOVERY_CODE_BYTE_SIZE)
    .toString("base64url")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
  return formatRecoveryCode(chars);
}

export async function generateAdminRecoveryCodes(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
    },
  });
  if (!user) {
    return { ok: false as const, error: "User not found" };
  }
  if (!user.twoFactorEnabled) {
    return { ok: false as const, error: "Enable 2FA before generating recovery codes." };
  }

  const parsed = parseRecoveryState(user.twoFactorSecret);
  const plainCodes = Array.from({ length: RECOVERY_CODE_COUNT }, () => generateRecoveryCode());
  const hashedCodes = await Promise.all(
    plainCodes.map((code) => bcrypt.hash(normalizeRecoveryCode(code), 10)),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: serializeRecoveryState({
        ...parsed,
        backupCodeHashes: hashedCodes,
      }),
    },
  });

  return {
    ok: true as const,
    codes: plainCodes,
  };
}

export async function consumeAdminRecoveryCode(input: {
  email: string;
  recoveryCode: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedCode = normalizeRecoveryCode(input.recoveryCode);
  if (!normalizedEmail || !normalizedCode) {
    return { ok: false as const, error: "Invalid recovery code" };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
    },
  });
  if (!user || !user.twoFactorEnabled) {
    return { ok: false as const, error: "Invalid recovery code" };
  }

  const parsed = parseRecoveryState(user.twoFactorSecret);
  if (parsed.backupCodeHashes.length === 0) {
    return { ok: false as const, error: "No recovery codes configured for this account." };
  }

  let matchedIndex = -1;
  for (let index = 0; index < parsed.backupCodeHashes.length; index += 1) {
    const hash = parsed.backupCodeHashes[index];
    const valid = await bcrypt.compare(normalizedCode, hash);
    if (valid) {
      matchedIndex = index;
      break;
    }
  }

  if (matchedIndex === -1) {
    return { ok: false as const, error: "Invalid recovery code" };
  }

  const nextHashes = parsed.backupCodeHashes.filter((_, index) => index !== matchedIndex);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: serializeRecoveryState({
        ...parsed,
        backupCodeHashes: nextHashes,
      }),
    },
  });

  return {
    ok: true as const,
    userId: user.id,
    remainingCodes: nextHashes.length,
  };
}

export async function getAdminRecoveryCodeInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  });
  if (!user) {
    return {
      enabled: false,
      recoveryCodeCount: 0,
    };
  }
  const parsed = parseRecoveryState(user.twoFactorSecret);
  return {
    enabled: user.twoFactorEnabled,
    recoveryCodeCount: parsed.backupCodeHashes.length,
  };
}
