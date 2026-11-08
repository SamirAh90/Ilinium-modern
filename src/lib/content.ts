// Shared types + pure helpers for site content (browser- and server-safe).

export type SeoEntry = { title: string; description: string };
export type SectionKey = "intro" | "treatments" | "team" | "gallery" | "why" | "location" | "cta";

export const SECTION_LABELS: Record<SectionKey, string> = {
  intro: "Introduktion",
  treatments: "Populära behandlingar",
  team: "Möt våra frisörer",
  gallery: "Galleri",
  why: "Varför Ilinium",
  location: "Hitta till oss",
  cta: "Avslutande uppmaning",
};

export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: string;
  };
  intro: { title: string; text: string; image: string };
  treatmentsSection: { title: string };
  teamSection: { title: string; subtitle: string };
  gallerySection: { title: string };
  why: { title: string; items: { title: string; text: string }[] };
  cta: { title: string; text: string };
  sections: Record<SectionKey, boolean>;
  sectionOrder: SectionKey[];
  announcement: { enabled: boolean; text: string };
  contact: {
    street: string;
    postal: string;
    area: string;
    phone: string;
    email: string;
    mapsUrl: string;
    bookingInfo: string;
    cancellation: string;
    hoursNote: string;
  };
  social: {
    facebook: string;
    facebookLinda: string;
    instagramJasmine: string;
    instagramLinda?: string;
    website?: string;
  };
  pages: {
    treatmentsTitle: string;
    treatmentsIntro: string;
    treatmentsTerms: string;
    teamTitle: string;
    teamIntro: string;
    galleryTitle: string;
    galleryIntro: string;
    aboutTitle: string;
    aboutText: string;
    aboutImage?: string;
    contactTitle: string;
    contactIntro: string;
  };
  skincare: { enabled: boolean; title: string; text: string };
  seo: Record<"home" | "treatments" | "team" | "gallery" | "about" | "contact", SeoEntry> & {
    legal?: SeoEntry;
  };
  footer: { tagline: string };
  legal?: { title: string; intro: string; sections: { title: string; text: string }[] };
};

export type Category = { id: string; name: string; sort_order: number };
export type Treatment = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  price_from: boolean;
  image_url: string | null;
  featured: boolean;
  visible: boolean;
  sort_order: number;
};
export type Staff = {
  id: string;
  name: string;
  role: string;
  bio: string;
  phone: string;
  image_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  visible: boolean;
  sort_order: number;
};
export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  visible: boolean;
  sort_order: number;
};
export type OpeningHour = {
  weekday: number;
  opens: string | null;
  closes: string | null;
  closed: boolean;
};
export type SpecialHour = {
  id: string;
  date: string;
  label: string;
  opens: string | null;
  closes: string | null;
  closed: boolean;
};

export type PublicContent = {
  settings: SiteContent;
  categories: Category[];
  treatments: Treatment[];
  staff: Staff[];
  gallery: GalleryImage[];
  hours: OpeningHour[];
  special: SpecialHour[];
};

export const WEEKDAYS = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

/** 1590 -> "1 590 kr"; with from -> "Från 1 590 kr" */
export function formatPrice(price: number, from = false): string {
  const n = String(Math.round(price)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${from ? "Från " : ""}${n}\u00a0kr`;
}

/** "10:00:00" -> "10.00" */
export function formatTime(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5).replace(":", ".");
}

export function formatHourRow(h: {
  opens: string | null;
  closes: string | null;
  closed: boolean;
}): string {
  if (h.closed || !h.opens || !h.closes) return "Stängt";
  return `${formatTime(h.opens)}–${formatTime(h.closes)}`;
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("0") ? "+46" + digits.slice(1) : digits}`;
}

export function paragraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function upcomingSpecial(special: SpecialHour[], today = new Date()): SpecialHour[] {
  const iso = today.toISOString().slice(0, 10);
  return special.filter((s) => s.date >= iso).sort((a, b) => a.date.localeCompare(b.date));
}
