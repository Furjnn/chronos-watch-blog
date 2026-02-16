// ═══ src/sanity/schemas/category.ts ═══
import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category", title: "Category", type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (R) => R.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (R) => R.required() }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({ name: "icon", type: "string", title: "Icon (emoji or code)" }),
  ],
});
