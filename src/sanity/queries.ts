import { groq } from "next-sanity";

// ─── Shared Projections ───

const authorProjection = `{
  name,
  slug,
  bio,
  avatar,
  role,
  socialLinks
}`;

const categoryProjection = `{
  name,
  slug,
  description,
  icon
}`;

const postCardProjection = `{
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  readingTime,
  "author": author->${authorProjection},
  "categories": categories[]->${categoryProjection}
}`;

// ─── Home Page ───

export const homePageQuery = groq`{
  "featured": *[_type == "post" && featured == true] | order(publishedAt desc)[0...5] {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    publishedAt,
    "category": categories[0]->{ name, slug }
  },
  "popular": *[_type == "post"] | order(views desc, publishedAt desc)[0...5] ${postCardProjection},
  "latest": *[_type == "post"] | order(publishedAt desc)[0...6] ${postCardProjection},
  "brands": *[_type == "brand"] | order(name asc) {
    _id,
    name,
    slug,
    logo
  }
}`;

// ─── Blog ───

export const blogIndexQuery = groq`{
  "posts": *[_type == "post" && ($category == "all" || $category in categories[]->slug.current)]
    | order(publishedAt desc)
    [($page - 1) * $pageSize...$page * $pageSize]
    ${postCardProjection},
  "total": count(*[_type == "post" && ($category == "all" || $category in categories[]->slug.current)]),
  "categories": *[_type == "category"] | order(name asc) ${categoryProjection}
}`;

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  body,
  publishedAt,
  readingTime,
  featured,
  "author": author->${authorProjection},
  "categories": categories[]->${categoryProjection},
  "tags": tags[]->{ name, slug },
  "brand": brand->{ name, slug, logo },
  "relatedPosts": relatedPosts[]->${postCardProjection},
  seo
}`;

export const allPostSlugsQuery = groq`*[_type == "post" && defined(slug.current)].slug.current`;

// ─── Reviews ───

export const reviewsIndexQuery = groq`*[_type == "review"]
  | order(publishedAt desc)
  [($page - 1) * $pageSize...$page * $pageSize]
  {
    _id,
    title,
    slug,
    watchRef,
    rating,
    "brand": brand->{ name, slug, logo },
    priceRange,
    gallery[0...1],
    publishedAt
  }`;

export const reviewBySlugQuery = groq`*[_type == "review" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  watchRef,
  "brand": brand->{ name, slug, logo, country },
  specs,
  rating,
  prosAndCons,
  gallery,
  body,
  priceRange,
  affiliateLinks,
  verdict,
  "author": author->${authorProjection},
  publishedAt,
  seo
}`;

export const allReviewSlugsQuery = groq`*[_type == "review" && defined(slug.current)].slug.current`;

// ─── Brands ───

export const brandsDirectoryQuery = groq`*[_type == "brand"]
  | order(name asc) {
    _id,
    name,
    slug,
    logo,
    country,
    founded,
    priceSegment,
    description,
    heroImage,
    "articleCount": count(*[_type == "post" && references(^._id)])
  }`;

export const brandBySlugQuery = groq`*[_type == "brand" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  logo,
  description,
  country,
  founded,
  priceSegment,
  website,
  heroImage,
  "posts": *[_type == "post" && references(^._id)] | order(publishedAt desc)[0...6] ${postCardProjection},
  "reviews": *[_type == "review" && references(^._id)] | order(publishedAt desc)[0...6] {
    _id, title, slug, rating, watchRef, priceRange, gallery[0]
  }
}`;

export const allBrandSlugsQuery = groq`*[_type == "brand" && defined(slug.current)].slug.current`;

// ─── Guides ───

export const guideBySlugQuery = groq`*[_type == "guide" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  body,
  priceRange,
  style,
  picks,
  "author": author->${authorProjection},
  publishedAt,
  seo
}`;

// ─── Authors ───

export const authorBySlugQuery = groq`*[_type == "author" && slug.current == $slug][0] {
  ...,
  "posts": *[_type == "post" && references(^._id)] | order(publishedAt desc)[0...12] ${postCardProjection},
  "reviews": *[_type == "review" && references(^._id)] | order(publishedAt desc)[0...6] {
    _id, title, slug, rating, watchRef, "brand": brand->{ name }
  }
}`;

// ─── Categories & Tags ───

export const postsByCategoryQuery = groq`{
  "category": *[_type == "category" && slug.current == $slug][0] ${categoryProjection},
  "posts": *[_type == "post" && $slug in categories[]->slug.current]
    | order(publishedAt desc)
    [($page - 1) * $pageSize...$page * $pageSize]
    ${postCardProjection},
  "total": count(*[_type == "post" && $slug in categories[]->slug.current])
}`;

export const postsByTagQuery = groq`{
  "tag": *[_type == "tag" && slug.current == $slug][0] { name, slug },
  "posts": *[_type == "post" && $slug in tags[]->slug.current]
    | order(publishedAt desc)
    [($page - 1) * $pageSize...$page * $pageSize]
    ${postCardProjection},
  "total": count(*[_type == "post" && $slug in tags[]->slug.current])
}`;

// ─── Search ───

export const searchQuery = groq`*[
  _type in ["post", "review", "brand", "guide"] &&
  (title match $query || excerpt match $query || body[].children[].text match $query)
] | order(publishedAt desc)[0...20] {
  _id,
  _type,
  title,
  slug,
  "excerpt": coalesce(excerpt, ""),
  "image": coalesce(coverImage, gallery[0]),
  publishedAt,
  readingTime
}`;

// ─── Site Settings ───

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0] {
  siteName,
  logo,
  socials,
  defaultSEO,
  footerCTA
}`;

// ─── Sitemap ───

export const sitemapQuery = groq`{
  "posts": *[_type == "post"]{ slug, publishedAt, _updatedAt },
  "reviews": *[_type == "review"]{ slug, publishedAt, _updatedAt },
  "brands": *[_type == "brand"]{ slug, _updatedAt },
  "guides": *[_type == "guide"]{ slug, publishedAt, _updatedAt },
  "categories": *[_type == "category"]{ slug },
  "tags": *[_type == "tag"]{ slug },
  "authors": *[_type == "author"]{ slug }
}`;
