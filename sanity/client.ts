import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-02-17";

// Public client (with CDN for production)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
});

// Server-side client with token (for drafts/preview)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Image URL builder
const builder = imageUrlBuilder(client);
type ImageSource = Parameters<typeof builder.image>[0];

export function urlFor(source: ImageSource) {
  return builder.image(source);
}
