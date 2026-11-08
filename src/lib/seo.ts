import type { PublicContent, SeoEntry } from "./content";

export const SITE_URL = (import.meta.env["VITE_SITE_URL"] || "https://www.ilinium.se").replace(
  /\/$/,
  "",
);
export const PUBLIC_PATHS = [
  "/",
  "/behandlingar",
  "/frisorer",
  "/galleri",
  "/om-oss",
  "/kontakt",
  "/integritet",
] as const;
export type PublicPath = (typeof PUBLIC_PATHS)[number];

export function seoHead(
  entry: SeoEntry | undefined,
  fallbackTitle: string,
  path: PublicPath,
  fallbackDescription = "",
) {
  const title = entry?.title.trim() || fallbackTitle;
  const description = entry?.description.trim() || fallbackDescription;
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "sv_SE" },
      { property: "og:site_name", content: "Salong Ilinium" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function salonSchema(content: PublicContent) {
  const s = content.settings;
  const postal = s.contact.postal.match(/^(\d{3})\s?(\d{2})/);
  const profiles = [
    s.social.facebook,
    s.social.facebookLinda,
    s.social.instagramJasmine,
    s.social.instagramLinda,
    s.social.website,
    ...content.staff.flatMap((person) => [person.facebook_url, person.instagram_url]),
  ];
  const sameAs = [
    ...new Set(
      profiles.filter((url): url is string => {
        if (!url) return false;
        try {
          const parsed = new URL(url);
          return (
            parsed.protocol === "https:" &&
            (parsed.pathname !== "/" || parsed.hostname === "www.ilinium.se")
          );
        } catch {
          return false;
        }
      }),
    ),
  ];
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${SITE_URL}/#salon`,
    name: "Salong Ilinium",
    url: `${SITE_URL}/`,
    telephone: s.contact.phone,
    email: s.contact.email,
    description: s.seo.home.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.contact.street,
      postalCode: postal ? `${postal[1]} ${postal[2]}` : s.contact.postal,
      addressLocality: "Stockholm",
      addressCountry: "SE",
    },
    ...(s.contact.mapsUrl ? { hasMap: s.contact.mapsUrl } : {}),
    sameAs,
    // Current opening hours have not been confirmed by the salon or Google.
    // Do not publish old directory hours as verified structured data.
  };
}
