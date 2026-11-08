import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand, PageHeader, PriceList } from "@/components/site/blocks";
import { publicContentQuery, seoHead, useContent } from "@/lib/use-content";
import { paragraphs } from "@/lib/content";

export const Route = createFileRoute("/behandlingar")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData }) =>
    seoHead(
      loaderData?.settings.seo.treatments,
      "Behandlingar & priser – Salong Ilinium",
      "/behandlingar",
      loaderData?.settings.pages.treatmentsIntro,
    ),
  component: Page,
});

function Page() {
  const c = useContent();
  const s = c.settings;
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Prislista"
        title={s.pages.treatmentsTitle}
        intro={s.pages.treatmentsIntro}
      />
      <div className="container-page py-16 md:py-24">
        <PriceList categories={c.categories} treatments={c.treatments} phone={s.contact.phone} />
        <section className="mt-14 rounded-2xl border border-border bg-muted/40 p-7 md:p-9">
          <h2 className="text-3xl">Bra att veta</h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {paragraphs(s.pages.treatmentsTerms).map((t, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground">
                <Check className="mt-1 size-4 shrink-0 text-taupe" />
                {t}
              </li>
            ))}
          </ul>
        </section>
        {s.skincare.enabled && (
          <section className="mt-14">
            <h2 className="text-3xl">{s.skincare.title}</h2>
            <p className="mt-3 text-muted-foreground">{s.skincare.text}</p>
          </section>
        )}
      </div>
      <CtaBand title={s.cta.title} text={s.cta.text} phone={s.contact.phone} />
    </SiteLayout>
  );
}
