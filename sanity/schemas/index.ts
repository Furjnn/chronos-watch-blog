// ─── src/sanity/schemas/index.ts ───
// Tüm şemaları buradan export ediyoruz

import { post } from "./post";
import { review } from "./review";
import { brand } from "./brand";
import { author } from "./author";
import { category } from "./category";
import { tag } from "./tag";
import { guide } from "./guide";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [
  post,
  review,
  brand,
  author,
  category,
  tag,
  guide,
  siteSettings,
];
