export function getBlobReadWriteToken() {
  const raw = process.env.BLOB_READ_WRITE_TOKEN;
  if (!raw) return "";

  // Guard against accidental copy/paste with quotes in env dashboards.
  return raw.trim().replace(/^['"]+|['"]+$/g, "");
}

export function isLikelyReadWriteBlobToken(token: string) {
  return token.startsWith("vercel_blob_rw_");
}
