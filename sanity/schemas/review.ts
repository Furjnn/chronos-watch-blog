// ═══════════════════════════════════════
// src/sanity/schemas/review.ts
// ═══════════════════════════════════════
import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Watch Review",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (R) => R.required() }),
    defineField({ name: "watchRef", title: "Reference Number", type: "string", validation: (R) => R.required() }),
    defineField({ name: "brand", title: "Brand", type: "reference", to: [{ type: "brand" }], validation: (R) => R.required() }),
    defineField({
      name: "specs",
      title: "Specifications",
      type: "object",
      fields: [
        { name: "caseSize", type: "string", title: "Case Size" },
        { name: "caseMaterial", type: "string", title: "Case Material" },
        { name: "caseThickness", type: "string", title: "Case Thickness" },
        { name: "lugToLug", type: "string", title: "Lug-to-Lug" },
        { name: "waterResistance", type: "string", title: "Water Resistance" },
        { name: "crystal", type: "string", title: "Crystal" },
        { name: "bezel", type: "string", title: "Bezel" },
        { name: "movement", type: "string", title: "Movement" },
        { name: "movementType", type: "string", title: "Movement Type" },
        { name: "powerReserve", type: "string", title: "Power Reserve" },
        { name: "frequency", type: "string", title: "Frequency" },
        { name: "bracelet", type: "string", title: "Bracelet" },
        { name: "clasp", type: "string", title: "Clasp" },
        { name: "lume", type: "string", title: "Lume" },
        { name: "weight", type: "string", title: "Weight" },
      ],
    }),
    defineField({ name: "rating", title: "Rating (1-10)", type: "number", validation: (R) => R.required().min(1).max(10) }),
    defineField({
      name: "prosAndCons",
      title: "Pros & Cons",
      type: "object",
      fields: [
        { name: "pros", type: "array", title: "Pros", of: [{ type: "string" }] },
        { name: "cons", type: "array", title: "Cons", of: [{ type: "string" }] },
      ],
    }),
    defineField({ name: "gallery", title: "Gallery", type: "array", of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alt" }] }], validation: (R) => R.min(3) }),
    defineField({ name: "body", title: "Full Review", type: "array", of: [{ type: "block" }, { type: "image", options: { hotspot: true } }] }),
    defineField({
      name: "priceRange",
      title: "Price Range",
      type: "object",
      fields: [
        { name: "min", type: "number", title: "Min Price" },
        { name: "max", type: "number", title: "Max Price" },
        { name: "currency", type: "string", title: "Currency", initialValue: "USD" },
      ],
    }),
    defineField({
      name: "affiliateLinks",
      title: "Affiliate Links",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "dealerName", type: "string", title: "Dealer" },
          { name: "url", type: "url", title: "URL" },
          { name: "price", type: "string", title: "Price" },
          { name: "type", type: "string", title: "Type", options: { list: ["Retail", "Pre-owned", "Grey Market"] } },
        ],
      }],
    }),
    defineField({ name: "verdict", title: "Verdict", type: "text", rows: 4, validation: (R) => R.required() }),
    defineField({ name: "author", title: "Reviewer", type: "reference", to: [{ type: "author" }], validation: (R) => R.required() }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime", validation: (R) => R.required() }),
    defineField({ name: "seo", title: "SEO", type: "object", fields: [{ name: "metaTitle", type: "string" }, { name: "metaDescription", type: "text", rows: 2 }, { name: "ogImage", type: "image" }] }),
  ],
  preview: {
    select: { title: "title", brand: "brand.name", rating: "rating", media: "gallery.0" },
    prepare({ title, brand, rating, media }) {
      return { title, subtitle: `${brand} · ${rating}/10`, media };
    },
  },
});
