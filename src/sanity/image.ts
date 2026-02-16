import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";
import type { SanityImage } from "@/types";

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImage) {
  return builder.image(source);
}

/**
 * Generate responsive image props for next/image
 */
export function getImageProps(image: SanityImage, width = 800) {
  if (!image?.asset) return null;

  return {
    src: urlFor(image).width(width).quality(85).auto("format").url(),
    alt: image.alt || "",
    blurDataURL: urlFor(image).width(24).quality(30).blur(50).url(),
    placeholder: "blur" as const,
  };
}
