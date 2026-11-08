import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand, PageHeader, Prose } from "@/components/site/blocks";
import { publicContentQuery, seoHead, useContent } from "@/lib/use-content";

export const Route = createFileRoute("/om-oss")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData }) =>
    seoHead(
      loaderData?.settings.seo.about,
      "Om oss – Salong Ilinium",
      "/om-oss",
      loaderData?.settings.intro.text,
    ),
  component: Page,
});

function Page() {
  const c = useContent();
  const s = c.settings;
  return (
    <SiteLayout>
      <PageHeader eyebrow="Om oss" title={s.pages.aboutTitle} />
      <section className="container-page grid items-start gap-12 py-16 md:grid-cols-2 md:py-24">
        <Prose text={s.pages.aboutText} />
        {s.pages.aboutImage && (
          <img
            src={s.pages.aboutImage}
            alt="Tre personer tillsammans i Salong Ilinium"
            loading="lazy"
            width={669}
            height={791}
            className="h-auto w-full rounded-lg shadow-soft"
          />
        )}
      </section>
      <CtaBand title={s.cta.title} text={s.cta.text} phone={s.contact.phone} />
    </SiteLayout>
  );
}
