// ═══ src/sanity/schemas/siteSettings.ts ═══
import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings", title: "Site Settings", type: "document",
  fields: [
    defineField({ name: "siteName", type: "string", initialValue: "Chronos" }),
    defineField({ name: "logo", type: "image" }),
    defineField({
      name: "socials", type: "object",
      fields: [
        { name: "instagram", type: "url" },
        { name: "twitter", type: "url" },
        { name: "youtube", type: "url" },
        { name: "pinterest", type: "url" },
      ],
    }),
    defineField({
      name: "defaultSEO", type: "object",
      fields: [
        { name: "metaTitle", type: "string" },
        { name: "metaDescription", type: "text", rows: 2 },
        { name: "ogImage", type: "image" },
      ],
    }),
    defineField({
      name: "footerCTA", type: "object",
      fields: [
        { name: "heading", type: "string" },
        { name: "subheading", type: "string" },
        { name: "ctaText", type: "string" },
      ],
    }),
  ],
  // Singleton: sadece tek bir doküman olmasını sağlıyoruz
  preview: {
    prepare() { return { title: "Site Settings" }; },
  },
});
