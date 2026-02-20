import "server-only";
import Ably from "ably";

function sanitizeEnvValue(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^['"]+|['"]+$/g, "");
}

export function getAblyApiKey() {
  return sanitizeEnvValue(process.env.ABLY_API_KEY);
}

export function isAblyConfigured() {
  return Boolean(getAblyApiKey());
}

export function createAblyRestClient() {
  const apiKey = getAblyApiKey();
  if (!apiKey) {
    throw new Error("ABLY_API_KEY is missing.");
  }
  return new Ably.Rest(apiKey);
}
