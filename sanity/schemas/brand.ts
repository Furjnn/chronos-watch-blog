// ═══ src/sanity/schemas/brand.ts ═══
import { defineField, defineType } from "sanity";

export const brand = defineType({
  name: "brand", title: "Brand", type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (R) => R.required() }),
    defineField({ name: "logo", type: "image", title: "Logo", description: "SVG preferred" }),
    defineField({ name: "description", type: "array", title: "Brand Story", of: [{ type: "block" }] }),
    defineField({ name: "country", type: "string", validation: (R) => R.required() }),
    defineField({ name: "founded", type: "number", title: "Year Founded" }),
    defineField({ name: "priceSegment", type: "string", options: { list: ["Entry", "Mid-Range", "Luxury", "Ultra-Luxury"] }, validation: (R) => R.required() }),
    defineField({ name: "website", type: "url" }),
    defineField({ name: "heroImage", type: "image", options: { hotspot: true } }),
  ],
  preview: {
    select: { title: "name", subtitle: "country", media: "logo" },
  },
});
