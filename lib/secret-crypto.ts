import crypto from "crypto";

const CIPHER_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKeyMaterial() {
  const source = process.env.AUTH_SECRET || process.env.NOTIFICATION_SECRET;
  if (!source) {
    throw new Error("Missing AUTH_SECRET for secret encryption");
  }
  return crypto.createHash("sha256").update(source).digest();
}

export function encryptSecret(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const key = getKeyMaterial();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(trimmed, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    CIPHER_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptSecret(payload: string) {
  const token = payload.trim();
  if (!token) return null;

  const [version, ivEncoded, tagEncoded, encryptedEncoded] = token.split(".");
  if (version !== CIPHER_VERSION || !ivEncoded || !tagEncoded || !encryptedEncoded) {
    return null;
  }

  try {
    const key = getKeyMaterial();
    const iv = Buffer.from(ivEncoded, "base64url");
    const tag = Buffer.from(tagEncoded, "base64url");
    const encrypted = Buffer.from(encryptedEncoded, "base64url");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
