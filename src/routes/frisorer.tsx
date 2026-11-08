import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader, TeamCard } from "@/components/site/blocks";
import { publicContentQuery, seoHead, useContent } from "@/lib/use-content";

export const Route = createFileRoute("/frisorer")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData }) =>
    seoHead(
      loaderData?.settings.seo.team,
      "Våra frisörer – Salong Ilinium",
      "/frisorer",
      loaderData?.settings.pages.teamIntro,
    ),
  component: Page,
});

function Page() {
  const c = useContent();
  const s = c.settings;
  return (
    <SiteLayout>
      <PageHeader eyebrow="Våra frisörer" title={s.pages.teamTitle} intro={s.pages.teamIntro} />
      <div className="container-page grid gap-6 py-16 md:grid-cols-3 md:py-24">
        {c.staff.map((m) => (
          <TeamCard key={m.id} s={m} />
        ))}
      </div>
      <p className="container-page pb-20 text-center text-sm text-muted-foreground">
        {s.contact.bookingInfo} {s.contact.cancellation}
      </p>
    </SiteLayout>
  );
}
