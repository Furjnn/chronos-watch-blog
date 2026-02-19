import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secret-crypto";

export type MailProvider = "resend" | "gmail";

export type StoredMailSettings = {
  enabled: boolean;
  provider: MailProvider;
  fromEmail: string;
  replyTo: string;
  apiKeyEncrypted: string | null;
  smtpUser: string;
  smtpPassEncrypted: string | null;
};

export type PublicMailSettings = {
  enabled: boolean;
  provider: MailProvider;
  fromEmail: string;
  replyTo: string;
  hasApiKey: boolean;
  smtpUser: string;
  hasSmtpPass: boolean;
};

export type RuntimeResendMailSettings = {
  provider: "resend";
  fromEmail: string;
  replyTo: string;
  apiKey: string;
};

export type RuntimeGmailMailSettings = {
  provider: "gmail";
  fromEmail: string;
  replyTo: string;
  smtpUser: string;
  smtpPass: string;
};

export type RuntimeMailSettings = RuntimeResendMailSettings | RuntimeGmailMailSettings;

const DEFAULT_STORED_MAIL_SETTINGS: StoredMailSettings = {
  enabled: false,
  provider: "resend",
  fromEmail: "",
  replyTo: "",
  apiKeyEncrypted: null,
  smtpUser: "",
  smtpPassEncrypted: null,
};

function asNonEmptyString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeProvider(value: unknown): MailProvider {
  const normalized = asNonEmptyString(value).toLowerCase();
  if (normalized === "gmail") return "gmail";
  if (normalized === "resend") return "resend";
  return "resend";
}

export function normalizeStoredMailSettings(input: unknown): StoredMailSettings {
  if (!input || typeof input !== "object") {
    return DEFAULT_STORED_MAIL_SETTINGS;
  }

  const raw = input as Partial<StoredMailSettings>;
  return {
    enabled: asBoolean(raw.enabled, false),
    provider: normalizeProvider(raw.provider),
    fromEmail: asNonEmptyString(raw.fromEmail),
    replyTo: asNonEmptyString(raw.replyTo),
    apiKeyEncrypted: asNonEmptyString(raw.apiKeyEncrypted) || null,
    smtpUser: asNonEmptyString(raw.smtpUser),
    smtpPassEncrypted: asNonEmptyString(raw.smtpPassEncrypted) || null,
  };
}

export function toPublicMailSettings(input: StoredMailSettings): PublicMailSettings {
  return {
    enabled: input.enabled,
    provider: input.provider,
    fromEmail: input.fromEmail,
    replyTo: input.replyTo,
    hasApiKey: Boolean(input.apiKeyEncrypted),
    smtpUser: input.smtpUser,
    hasSmtpPass: Boolean(input.smtpPassEncrypted),
  };
}

export type MailSettingsUpdateInput = {
  enabled?: boolean;
  provider?: string;
  fromEmail?: string;
  replyTo?: string;
  apiKey?: string;
  removeApiKey?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  removeSmtpPass?: boolean;
};

export function resolveMailSettingsUpdate(
  existing: StoredMailSettings,
  update: MailSettingsUpdateInput | null | undefined,
) {
  if (!update) return existing;

  const next: StoredMailSettings = {
    enabled: typeof update.enabled === "boolean" ? update.enabled : existing.enabled,
    provider: normalizeProvider(update.provider ?? existing.provider),
    fromEmail:
      typeof update.fromEmail === "string" ? update.fromEmail.trim() : existing.fromEmail,
    replyTo:
      typeof update.replyTo === "string" ? update.replyTo.trim() : existing.replyTo,
    apiKeyEncrypted: existing.apiKeyEncrypted,
    smtpUser: typeof update.smtpUser === "string" ? update.smtpUser.trim() : existing.smtpUser,
    smtpPassEncrypted: existing.smtpPassEncrypted,
  };

  if (update.removeApiKey) {
    next.apiKeyEncrypted = null;
  } else if (typeof update.apiKey === "string" && update.apiKey.trim().length > 0) {
    next.apiKeyEncrypted = encryptSecret(update.apiKey);
  }

  if (update.removeSmtpPass) {
    next.smtpPassEncrypted = null;
  } else if (typeof update.smtpPass === "string" && update.smtpPass.trim().length > 0) {
    next.smtpPassEncrypted = encryptSecret(update.smtpPass);
  }

  return next;
}

export function getStoredMailSettingsFromSocials(socials: unknown) {
  if (!socials || typeof socials !== "object") return DEFAULT_STORED_MAIL_SETTINGS;
  const payload = socials as { mail?: unknown };
  return normalizeStoredMailSettings(payload.mail);
}

export function getPublicMailSettingsFromSocials(socials: unknown) {
  return toPublicMailSettings(getStoredMailSettingsFromSocials(socials));
}

export function resolveRuntimeMailSettings(stored: StoredMailSettings): RuntimeMailSettings | null {
  if (!stored.enabled) return null;
  if (!stored.fromEmail.includes("@")) return null;

  if (stored.provider === "gmail") {
    const smtpUser = stored.smtpUser || stored.fromEmail;
    if (!smtpUser.includes("@")) return null;
    if (!stored.smtpPassEncrypted) return null;

    const smtpPass = decryptSecret(stored.smtpPassEncrypted);
    if (!smtpPass) return null;

    return {
      provider: "gmail",
      fromEmail: stored.fromEmail,
      replyTo: stored.replyTo,
      smtpUser,
      smtpPass,
    };
  }

  if (!stored.apiKeyEncrypted) return null;
  const apiKey = decryptSecret(stored.apiKeyEncrypted);
  if (!apiKey) return null;

  return {
    provider: "resend",
    fromEmail: stored.fromEmail,
    replyTo: stored.replyTo,
    apiKey,
  };
}

type MailSettingsCache = {
  fetchedAt: number;
  value: RuntimeMailSettings | null;
};

const globalMailCache = globalThis as unknown as {
  __chronosMailSettingsCache?: MailSettingsCache;
};

const mailSettingsCache =
  globalMailCache.__chronosMailSettingsCache ||
  {
    fetchedAt: 0,
    value: null,
  };

if (!globalMailCache.__chronosMailSettingsCache) {
  globalMailCache.__chronosMailSettingsCache = mailSettingsCache;
}

function resolveRuntimeFromEnv(): RuntimeMailSettings | null {
  const replyTo = asNonEmptyString(process.env.NOTIFICATION_REPLY_TO);
  const fromEmail = asNonEmptyString(process.env.NOTIFICATION_FROM_EMAIL);

  const resendApiKey = asNonEmptyString(process.env.RESEND_API_KEY);
  const resendFromEmail = fromEmail || asNonEmptyString(process.env.RESEND_FROM_EMAIL);
  if (resendApiKey && resendFromEmail.includes("@")) {
    return {
      provider: "resend",
      apiKey: resendApiKey,
      fromEmail: resendFromEmail,
      replyTo,
    };
  }

  const gmailUser = asNonEmptyString(process.env.GMAIL_SMTP_USER);
  const gmailPass = asNonEmptyString(process.env.GMAIL_SMTP_PASS);
  const gmailFromEmail = fromEmail || gmailUser;
  if (gmailUser && gmailPass && gmailFromEmail.includes("@")) {
    return {
      provider: "gmail",
      fromEmail: gmailFromEmail,
      replyTo,
      smtpUser: gmailUser,
      smtpPass: gmailPass,
    };
  }

  return null;
}

export async function getRuntimeMailSettings(options?: { force?: boolean }) {
  const now = Date.now();
  const cacheTtlMs = 60_000;

  if (!options?.force && now - mailSettingsCache.fetchedAt < cacheTtlMs) {
    return mailSettingsCache.value || resolveRuntimeFromEnv();
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { socials: true },
  });
  const stored = getStoredMailSettingsFromSocials(settings?.socials);
  const runtime = resolveRuntimeMailSettings(stored);

  mailSettingsCache.fetchedAt = now;
  mailSettingsCache.value = runtime;
  return runtime || resolveRuntimeFromEnv();
}

export async function isMailDeliveryConfigured() {
  const config = await getRuntimeMailSettings();
  if (!config) return false;
  if (config.provider === "resend") {
    return Boolean(config.apiKey && config.fromEmail);
  }
  return Boolean(config.smtpUser && config.smtpPass && config.fromEmail);
}

export function clearRuntimeMailSettingsCache() {
  mailSettingsCache.fetchedAt = 0;
  mailSettingsCache.value = null;
}
