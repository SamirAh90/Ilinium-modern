import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PUBLIC_PATHS, SITE_URL, salonSchema, seoHead } from "@/lib/seo";
import type { PublicContent } from "@/lib/content";

describe("Salong Ilinium SEO", () => {
  it("self-references each public page on the current project domain", () => {
    for (const path of PUBLIC_PATHS) {
      const head = seoHead(undefined, "Salong Ilinium", path);
      expect(head.links).toEqual([{ rel: "canonical", href: `${SITE_URL}${path}` }]);
      expect(head.meta.find((m) => "property" in m && m.property === "og:url")?.content).toBe(
        `${SITE_URL}${path}`,
      );
    }
  });

  it("includes exactly seven public pages and no admin or login URLs in the sitemap", () => {
    const sitemap = readFileSync(`${process.cwd()}/public/sitemap.xml`, "utf8");
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(urls).toEqual(PUBLIC_PATHS.map((path) => `${SITE_URL}${path}`));
    expect(urls).toHaveLength(7);
    expect(urls.some((url) => /admin|auth|reset-password/.test(url))).toBe(false);
  });

  it("uses the supplied Google profile and all supplied official social links without invented hours", () => {
    const content = {
      settings: {
        contact: {
          street: "Hantverkargatan 42",
          postal: "112 21 Stockholm",
          phone: "08-654 52 52",
          email: "ilinium@gmail.com",
          mapsUrl: "https://share.google/j5v37bTs5KNraVuFl",
        },
        social: {
          facebook: "https://www.facebook.com/salongilinium/",
          facebookLinda: "https://www.facebook.com/iliniumlinda/",
          instagramJasmine: "https://www.instagram.com/ilinium_frisorjasmine/",
          instagramLinda: "https://www.instagram.com/ilinium_frisorlinda/",
          website: "https://www.ilinium.se/",
        },
        seo: { home: { description: "Frisör på Kungsholmen." } },
      },
      staff: [
        {
          facebook_url: "https://www.facebook.com/",
          instagram_url: "https://www.instagram.com/ilinium_frisorlinda/",
        },
      ],
    } as unknown as PublicContent;
    const schema = salonSchema(content);
    expect(schema.hasMap).toBe("https://share.google/j5v37bTs5KNraVuFl");
    expect(schema.address.postalCode).toBe("112 21");
    expect(schema.sameAs).toEqual(Object.values(content.settings.social));
    expect(schema).not.toHaveProperty("openingHoursSpecification");
    expect(schema).not.toHaveProperty("aggregateRating");
  });
});
