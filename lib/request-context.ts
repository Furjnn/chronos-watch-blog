import type { NextRequest } from "next/server";
import crypto from "crypto";

type RequestLike = Pick<Request, "headers"> & {
  ip?: string | null;
};

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

export function getClientIp(request: RequestLike) {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ip = xForwardedFor.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  if (request.ip) return request.ip;
  return null;
}

export function getUserAgent(request: RequestLike) {
  const userAgent = request.headers.get("user-agent");
  return userAgent ? userAgent.slice(0, 512) : null;
}

export function getRequestContext(request: NextRequest | Request) {
  return {
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  } satisfies RequestContext;
}

export function hashIpAddress(ipAddress: string | null) {
  if (!ipAddress) return null;
  return crypto.createHash("sha256").update(ipAddress).digest("hex");
}
