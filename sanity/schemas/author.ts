// ═══ src/sanity/schemas/author.ts ═══
import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author", title: "Author", type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (R) => R.required() }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    defineField({ name: "avatar", type: "image", options: { hotspot: true } }),
    defineField({ name: "role", type: "string", title: "Role/Title" }),
    defineField({
      name: "socialLinks", type: "object",
      fields: [
        { name: "twitter", type: "url", title: "Twitter/X" },
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "website", type: "url", title: "Website" },
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "avatar" },
  },
});
