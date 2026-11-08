import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ContactDetails, PageHeader } from "@/components/site/blocks";
import { paragraphs } from "@/lib/content";
import { publicContentQuery, seoHead, useContent } from "@/lib/use-content";

export const Route = createFileRoute("/integritet")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData }) =>
    seoHead(
      loaderData?.settings.seo.legal ?? {
        title: `${loaderData?.settings.legal?.title ?? "Integritet"} – Salong Ilinium`,
        description:
          loaderData?.settings.legal?.intro ??
          "Information om kontakt och integritet hos Salong Ilinium.",
      },
      "Integritet – Salong Ilinium",
      "/integritet",
    ),
  component: Page,
});

function Page() {
  const { settings } = useContent();
  const legal = settings.legal;
  if (!legal)
    return (
      <SiteLayout>
        <div className="container-page py-16">
          <ContactDetails c={settings.contact} />
        </div>
      </SiteLayout>
    );
  return (
    <SiteLayout>
      <PageHeader title={legal.title} intro={legal.intro} />
      <div className="container-page py-12 md:py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          {legal.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-3xl">{section.title}</h2>
              <div className="mt-4 space-y-4 text-body leading-relaxed">
                {paragraphs(section.text).map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </section>
          ))}
          <section className="border-t border-border pt-8">
            <h2 className="mb-5 text-3xl">Salong Ilinium</h2>
            <ContactDetails c={settings.contact} />
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
