export interface AboutStat {
  num: string;
  label: string;
}

export interface AboutTeamMember {
  name: string;
  role: string;
  bio: string;
  img: string;
}

export interface AboutPageContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  missionHeading: string;
  missionParagraphOne: string;
  missionQuote: string;
  missionParagraphTwo: string;
  teamBadge: string;
  teamHeading: string;
  contactHeading: string;
  contactSubtitle: string;
  contactButtonLabel: string;
  stats: AboutStat[];
  team: AboutTeamMember[];
}

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  heroBadge: "Our Story",
  heroTitle: "About Chronos",
  heroSubtitle: "We believe great watchmaking deserves great storytelling.",
  missionHeading: "Our Mission",
  missionParagraphOne:
    "In a world of fleeting trends and disposable technology, mechanical watches represent something enduring - craftsmanship passed down through generations, engineering that transcends its era.",
  missionQuote: "Every watch has a story. Our job is to tell it beautifully.",
  missionParagraphTwo:
    "Whether you're buying your first automatic or adding a grail piece to your collection, we're here to guide, inform, and inspire.",
  teamBadge: "The People",
  teamHeading: "Editorial Team",
  contactHeading: "Get in Touch",
  contactSubtitle: "Have a question, story tip, or partnership inquiry?",
  contactButtonLabel: "Send Message",
  stats: [
    { num: "500+", label: "Articles Published" },
    { num: "12.4K", label: "Newsletter Subscribers" },
    { num: "85+", label: "Brands Covered" },
    { num: "4", label: "Years Running" },
  ],
  team: [
    {
      name: "James Chen",
      role: "Senior Watch Editor",
      bio: "15 years covering the watch industry. Dive watch specialist.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    },
    {
      name: "Sofia Laurent",
      role: "Buying Guide Editor",
      bio: "Former luxury retail consultant. Investment watch expert.",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    },
    {
      name: "Emilia Hartwell",
      role: "Culture & Heritage Writer",
      bio: "Historian focused on cultural significance of watchmaking.",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
    },
    {
      name: "Luca Moretti",
      role: "Technical Editor",
      bio: "Trained watchmaker turned writer. Movement specialist.",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    },
  ],
};

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export function normalizeAboutPage(input: unknown): AboutPageContent {
  if (!input || typeof input !== "object") return DEFAULT_ABOUT_PAGE;
  const raw = input as Partial<AboutPageContent>;

  const stats = Array.isArray(raw.stats)
    ? raw.stats
        .map((stat) => {
          if (!stat || typeof stat !== "object") return null;
          const item = stat as Partial<AboutStat>;
          return {
            num: asString(item.num, ""),
            label: asString(item.label, ""),
          };
        })
        .filter((stat): stat is AboutStat => Boolean(stat && stat.num && stat.label))
    : [];

  const team = Array.isArray(raw.team)
    ? raw.team
        .map((member) => {
          if (!member || typeof member !== "object") return null;
          const item = member as Partial<AboutTeamMember>;
          return {
            name: asString(item.name, ""),
            role: asString(item.role, ""),
            bio: asString(item.bio, ""),
            img: asString(item.img, ""),
          };
        })
        .filter((member): member is AboutTeamMember => Boolean(member && member.name))
    : [];

  return {
    heroBadge: asString(raw.heroBadge, DEFAULT_ABOUT_PAGE.heroBadge),
    heroTitle: asString(raw.heroTitle, DEFAULT_ABOUT_PAGE.heroTitle),
    heroSubtitle: asString(raw.heroSubtitle, DEFAULT_ABOUT_PAGE.heroSubtitle),
    missionHeading: asString(raw.missionHeading, DEFAULT_ABOUT_PAGE.missionHeading),
    missionParagraphOne: asString(raw.missionParagraphOne, DEFAULT_ABOUT_PAGE.missionParagraphOne),
    missionQuote: asString(raw.missionQuote, DEFAULT_ABOUT_PAGE.missionQuote),
    missionParagraphTwo: asString(raw.missionParagraphTwo, DEFAULT_ABOUT_PAGE.missionParagraphTwo),
    teamBadge: asString(raw.teamBadge, DEFAULT_ABOUT_PAGE.teamBadge),
    teamHeading: asString(raw.teamHeading, DEFAULT_ABOUT_PAGE.teamHeading),
    contactHeading: asString(raw.contactHeading, DEFAULT_ABOUT_PAGE.contactHeading),
    contactSubtitle: asString(raw.contactSubtitle, DEFAULT_ABOUT_PAGE.contactSubtitle),
    contactButtonLabel: asString(raw.contactButtonLabel, DEFAULT_ABOUT_PAGE.contactButtonLabel),
    stats: stats.length > 0 ? stats : DEFAULT_ABOUT_PAGE.stats,
    team: team.length > 0 ? team : DEFAULT_ABOUT_PAGE.team,
  };
}
