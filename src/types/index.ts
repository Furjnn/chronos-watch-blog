// ─── CHRONOS Type Definitions ───

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Author {
  _id: string;
  name: string;
  slug: { current: string };
  bio: string;
  avatar: SanityImage;
  role: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  icon?: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: { current: string };
}

export interface Brand {
  _id: string;
  name: string;
  slug: { current: string };
  logo?: SanityImage;
  description?: unknown[]; // Portable Text
  country: string;
  founded?: number;
  priceSegment: "Entry" | "Mid-Range" | "Luxury" | "Ultra-Luxury";
  website?: string;
  heroImage?: SanityImage;
}

export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  coverImage: SanityImage;
  body: unknown[]; // Portable Text
  author: Author;
  categories: Category[];
  tags?: Tag[];
  brand?: Brand;
  publishedAt: string;
  featured?: boolean;
  readingTime?: number;
  seo?: SEOFields;
  relatedPosts?: Post[];
}

export interface ReviewSpecs {
  caseSize?: string;
  caseMaterial?: string;
  caseThickness?: string;
  lugToLug?: string;
  waterResistance?: string;
  crystal?: string;
  bezel?: string;
  movement?: string;
  movementType?: string;
  powerReserve?: string;
  frequency?: string;
  bracelet?: string;
  clasp?: string;
  lume?: string;
  weight?: string;
}

export interface Review {
  _id: string;
  title: string;
  slug: { current: string };
  watchRef: string;
  brand: Brand;
  specs: ReviewSpecs;
  rating: number;
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  gallery: SanityImage[];
  body: unknown[]; // Portable Text
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  affiliateLinks?: {
    dealerName: string;
    url: string;
    price?: string;
    type?: string;
  }[];
  verdict: string;
  author: Author;
  publishedAt: string;
  seo?: SEOFields;
}

export interface Guide {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  coverImage: SanityImage;
  body: unknown[]; // Portable Text
  priceRange?: {
    min: number;
    max: number;
  };
  style?: string;
  picks?: {
    name: string;
    brand: string;
    price: string;
    image: SanityImage;
    summary: string;
    affiliateUrl?: string;
  }[];
  author: Author;
  publishedAt: string;
}

export interface SEOFields {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
}

export interface SiteSettings {
  siteName: string;
  logo?: SanityImage;
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
  };
  defaultSEO?: SEOFields;
  footerCTA?: {
    heading: string;
    subheading: string;
    ctaText: string;
  };
}

// ─── Utility Types ───

export type PostSummary = Pick<
  Post,
  "_id" | "title" | "slug" | "excerpt" | "coverImage" | "publishedAt" | "readingTime"
> & {
  author: Pick<Author, "name" | "slug" | "avatar">;
  categories: Pick<Category, "name" | "slug">[];
};

export type ReviewSummary = Pick<
  Review,
  "_id" | "title" | "slug" | "rating" | "watchRef"
> & {
  brand: Pick<Brand, "name" | "slug" | "logo">;
  priceRange: Review["priceRange"];
  gallery: SanityImage[];
};

export type BrandSummary = Pick<
  Brand,
  "_id" | "name" | "slug" | "country" | "founded" | "priceSegment" | "logo"
> & {
  articleCount: number;
};
