import { HeroSlider } from "@/components/hero/HeroSlider";
import { BrandStrip } from "@/components/sections/BrandStrip";
import { PopularPosts } from "@/components/sections/PopularPosts";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { Categories } from "@/components/sections/Categories";
import { Newsletter } from "@/components/cta/Newsletter";

// Mock data — sonra Sanity'den gelecek
const SLIDES = [
  { id: "1", badge: "Featured Article", title: "The Art of Timekeeping", excerpt: "Exploring the craftsmanship and heritage behind the world's most prestigious timepieces", image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1400&q=80", slug: "art-of-timekeeping" },
  { id: "2", badge: "Editor's Pick", title: "The New Submariner: A Deep Dive", excerpt: "An in-depth look at the latest iteration of the iconic diving watch that has defined a category", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1400&q=80", slug: "new-submariner" },
  { id: "3", badge: "Collector's Guide", title: "Investment Pieces Worth Collecting", excerpt: "Expert insights on which timepieces are likely to appreciate in value and why they matter", image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1400&q=80", slug: "investment-pieces" },
  { id: "4", badge: "Heritage", title: "Swiss Craftsmanship Through the Ages", excerpt: "Exploring the centuries-old traditions that make Swiss watchmaking the gold standard", image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1400&q=80", slug: "swiss-craftsmanship" },
];

const BRANDS = ["ROLEX", "OMEGA", "PATEK PHILIPPE", "CARTIER", "AUDEMARS PIGUET", "JAEGER-LECOULTRE", "IWC", "TUDOR", "GRAND SEIKO", "BREITLING", "TAG HEUER", "RAYMOND WEIL"];

const POPULAR = [
  { id: "1", rank: 1, title: "Why the Rolex Daytona Remains the Ultimate Chronograph", category: "Review", date: "Feb 15, 2026", readTime: "14 min", views: "32.1K", image: "https://images.unsplash.com/photo-1627037558426-c2d07beda3af?w=800&q=80", slug: "rolex-daytona" },
  { id: "2", rank: 2, title: "The Complete Guide to Watch Movements Explained", category: "Technical", date: "Feb 13, 2026", readTime: "18 min", views: "28.4K", image: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800&q=80", slug: "watch-movements" },
  { id: "3", rank: 3, title: "Vintage Omega Seamasters: A Collector's Roadmap", category: "Vintage", date: "Feb 11, 2026", readTime: "12 min", views: "21.7K", image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80", slug: "vintage-omega" },
  { id: "4", rank: 4, title: "Best Dress Watches Under $2,000 in 2026", category: "Guide", date: "Feb 9, 2026", readTime: "9 min", views: "19.3K", image: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80", slug: "dress-watches" },
];

const LATEST = [
  { id: "1", category: "Review", title: "The New Submariner: A Deep Dive", excerpt: "An in-depth look at the latest iteration of the iconic diving watch.", author: "James Chen", date: "Feb 14, 2026", readTime: "8 min", image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&q=80", slug: "new-submariner" },
  { id: "2", category: "Guide", title: "Investment Pieces: What to Buy in 2026", excerpt: "Expert insights on which timepieces appreciate in value.", author: "Sofia Laurent", date: "Feb 12, 2026", readTime: "12 min", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80", slug: "investment-pieces" },
  { id: "3", category: "Heritage", title: "Swiss Craftsmanship Through the Ages", excerpt: "Centuries-old traditions that define Swiss watchmaking.", author: "Emilia Hartwell", date: "Feb 10, 2026", readTime: "10 min", image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&q=80", slug: "swiss-craftsmanship" },
  { id: "4", category: "Technical", title: "Understanding Complications", excerpt: "Complex mechanisms that elevate a watch from good to exceptional.", author: "Luca Moretti", date: "Feb 8, 2026", readTime: "15 min", image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80", slug: "understanding-complications" },
  { id: "5", category: "Vintage", title: "The Golden Age of Horology", excerpt: "The timeless appeal of mid-century timepieces.", author: "James Chen", date: "Feb 6, 2026", readTime: "9 min", image: "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=600&q=80", slug: "golden-age" },
  { id: "6", category: "Interview", title: "Master Watchmaker's Perspective", excerpt: "An exclusive conversation about the future of horology.", author: "Sofia Laurent", date: "Feb 4, 2026", readTime: "11 min", image: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?w=600&q=80", slug: "watchmaker-perspective" },
];

const CATEGORIES = [
  { name: "Reviews", count: 124, icon: "★" },
  { name: "Vintage", count: 89, icon: "◎" },
  { name: "News", count: 201, icon: "◆" },
  { name: "Technical", count: 67, icon: "⚙" },
  { name: "Brands", count: 156, icon: "◈" },
  { name: "Buying Guides", count: 45, icon: "▸" },
  { name: "Collecting", count: 78, icon: "◉" },
  { name: "Interviews", count: 34, icon: "◇" },
];

export default function HomePage() {
  return (
    <>
      <HeroSlider slides={SLIDES} />
      <BrandStrip brands={BRANDS} />
      <PopularPosts posts={POPULAR} />
      <LatestArticles posts={LATEST} />
      <Categories categories={CATEGORIES} />
      <Newsletter />
    </>
  );
}
