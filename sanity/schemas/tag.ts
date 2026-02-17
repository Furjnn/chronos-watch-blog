// ═══ src/sanity/schemas/tag.ts ═══
import { defineField, defineType } from "sanity";

export const tag = defineType({
  name: "tag", title: "Tag", type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (R) => R.required() }),
  ],
});
