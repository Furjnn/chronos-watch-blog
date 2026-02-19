import { prisma } from "@/lib/prisma";
import type { JSONContent } from "@tiptap/core";

export const COMMUNITY_AUTHOR_SLUG = "chronos-community";

export async function ensureCommunityAuthor() {
  return prisma.author.upsert({
    where: { slug: COMMUNITY_AUTHOR_SLUG },
    update: {},
    create: {
      name: "Chronos Community",
      slug: COMMUNITY_AUTHOR_SLUG,
      role: "Community Contributor",
      bio: "Reader stories and submissions reviewed by the Chronos editorial team.",
    },
    select: { id: true },
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildSubmissionSlug(title: string, memberId: string) {
  const base = slugify(title) || "community-post";
  const suffix = memberId.slice(0, 6);
  return `${base}-${suffix}-${Date.now().toString(36)}`;
}

export function plainTextToTiptapDoc(content: string) {
  const text = content.trim() || "Untitled submission";

  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({
      type: "paragraph",
      content: [{ type: "text", text: part }],
    }));

  return {
    type: "doc",
    content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

export function normalizeSubmissionBody(content: unknown): JSONContent | null {
  if (typeof content === "string") {
    return plainTextToTiptapDoc(content);
  }

  if (content && typeof content === "object" && "type" in (content as Record<string, unknown>)) {
    return content as JSONContent;
  }

  return null;
}

function collectText(node: JSONContent | null | undefined, parts: string[]) {
  if (!node) return;
  if (typeof node.text === "string") {
    parts.push(node.text);
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      collectText(child, parts);
    }
  }
}

export function extractSubmissionText(content: JSONContent | null): string {
  if (!content) return "";
  const parts: string[] = [];
  collectText(content, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
