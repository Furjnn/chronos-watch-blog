// ═══ src/sanity/schemas/guide.ts ═══
import { defineField, defineType } from "sanity";

export const guide = defineType({
  name: "guide", title: "Buying Guide", type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (R) => R.required() }),
    defineField({ name: "excerpt", type: "text", rows: 3, validation: (R) => R.required().max(160) }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true }, validation: (R) => R.required() }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }, { type: "image", options: { hotspot: true } }] }),
    defineField({
      name: "priceRange", type: "object",
      fields: [
        { name: "min", type: "number", title: "Min" },
        { name: "max", type: "number", title: "Max" },
      ],
    }),
    defineField({ name: "style", type: "string", options: { list: ["Dress", "Dive", "Sport", "Pilot", "Field", "Casual"] } }),
    defineField({
      name: "picks", type: "array", title: "Recommended Picks",
      of: [{
        type: "object",
        fields: [
          { name: "name", type: "string", title: "Watch Name" },
          { name: "brand", type: "string", title: "Brand" },
          { name: "price", type: "string", title: "Price" },
          { name: "image", type: "image", options: { hotspot: true } },
          { name: "summary", type: "text", title: "Mini Review", rows: 3 },
          { name: "affiliateUrl", type: "url", title: "Affiliate Link" },
        ],
        preview: {
          select: { title: "name", subtitle: "brand" },
        },
      }],
    }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }], validation: (R) => R.required() }),
    defineField({ name: "publishedAt", type: "datetime", validation: (R) => R.required() }),
    defineField({ name: "seo", type: "object", fields: [{ name: "metaTitle", type: "string" }, { name: "metaDescription", type: "text", rows: 2 }, { name: "ogImage", type: "image" }] }),
  ],
  preview: {
    select: { title: "title", subtitle: "style", media: "coverImage" },
  },
});
