import { groq } from "next-sanity";

// ─── Projections ───
const authorP = `{ name, slug, bio, avatar, role }`;
const categoryP = `{ name, slug }`;
const postCardP = `{
  _id, title, slug, excerpt, coverImage, publishedAt, readingTime,
  "author": author->${authorP},
  "categories": categories[]->${categoryP}
}`;

// ─── Home Page ───
export const homeQuery = groq`{
  "featured": *[_type == "post" && featured == true] | order(publishedAt desc)[0...5] {
    _id, title, slug, excerpt, coverImage, publishedAt,
    "category": categories[0]->{ name, slug }
  },
  "popular": *[_type == "post"] | order(publishedAt desc)[0...4] ${postCardP},
  "latest": *[_type == "post"] | order(publishedAt desc)[0...6] ${postCardP},
  "brands": *[_type == "brand"] | order(name asc) { _id, name, slug, logo }
}`;

// ─── Blog Index ───
export const blogIndexQuery = groq`{
  "posts": *[_type == "post"] | order(publishedAt desc)[0...12] ${postCardP},
  "total": count(*[_type == "post"]),
  "categories": *[_type == "category"] | order(name asc) ${categoryP}
}`;

// ─── Single Post ───
export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id, title, slug, excerpt, coverImage, body, publishedAt, readingTime,
  "author": author->${authorP},
  "categories": categories[]->${categoryP},
  "tags": tags[]->{ name, slug },
  "relatedPosts": *[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0...3] ${postCardP}
}`;

export const allPostSlugsQuery = groq`*[_type == "post" && defined(slug.current)].slug.current`;

// ─── Reviews ───
export const reviewsIndexQuery = groq`*[_type == "review"] | order(publishedAt desc) {
  _id, title, slug, watchRef, rating,
  "brand": brand->{ name, slug, logo },
  priceRange, gallery[0...1], publishedAt
}`;

export const reviewBySlugQuery = groq`*[_type == "review" && slug.current == $slug][0] {
  _id, title, slug, watchRef,
  "brand": brand->{ name, slug, logo, country },
  specs, rating, prosAndCons, gallery, body, priceRange, affiliateLinks, verdict,
  "author": author->${authorP},
  publishedAt
}`;

export const allReviewSlugsQuery = groq`*[_type == "review" && defined(slug.current)].slug.current`;

// ─── Brands ───
export const brandsQuery = groq`*[_type == "brand"] | order(name asc) {
  _id, name, slug, logo, country, founded, priceSegment, description, heroImage,
  "articleCount": count(*[_type == "post" && references(^._id)])
}`;

export const brandBySlugQuery = groq`*[_type == "brand" && slug.current == $slug][0] {
  _id, name, slug, logo, description, country, founded, priceSegment, website, heroImage,
  "posts": *[_type == "post" && references(^._id)] | order(publishedAt desc)[0...6] ${postCardP},
  "reviews": *[_type == "review" && references(^._id)] | order(publishedAt desc)[0...6] {
    _id, title, slug, rating, watchRef, priceRange, gallery[0]
  }
}`;

// ─── Search ───
export const searchQuery = groq`*[
  _type in ["post", "review", "brand"] &&
  (title match $q + "*" || excerpt match $q + "*")
] | order(publishedAt desc)[0...20] {
  _id, _type, title, slug,
  "excerpt": coalesce(excerpt, ""),
  "image": coalesce(coverImage, gallery[0]),
  publishedAt, readingTime
}`;

// ─── Site Settings ───
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]`;
