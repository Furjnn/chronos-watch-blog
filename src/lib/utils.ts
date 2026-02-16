// ═══ src/lib/utils.ts ═══

import { type ClassValue, clsx } from "clsx";

/**
 * Format a date string to readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate reading time from text/portable text
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Get category badge color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Review: "#2D6A4F",
    Guide: "#7B2D8B",
    Heritage: "#B8956A",
    Technical: "#2563EB",
    Vintage: "#9A3412",
    Interview: "#0F766E",
    Culture: "#B91C1C",
    News: "#1E40AF",
  };
  return colors[category] || "#777777";
}

/**
 * Get price segment badge color
 */
export function getSegmentColor(segment: string): string {
  const colors: Record<string, string> = {
    Entry: "#2563EB",
    "Mid-Range": "#0F766E",
    Luxury: "#B8956A",
    "Ultra-Luxury": "#7B2D8B",
  };
  return colors[segment] || "#777777";
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/**
 * Generate URL for different content types
 */
export function getContentUrl(
  type: "post" | "review" | "brand" | "guide" | "author" | "category" | "tag",
  slug: string
): string {
  const prefixes: Record<string, string> = {
    post: "/blog",
    review: "/reviews",
    brand: "/brands",
    guide: "/guides",
    author: "/author",
    category: "/category",
    tag: "/tag",
  };
  return `${prefixes[type]}/${slug}`;
}
