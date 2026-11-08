import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ContactDetails, MapEmbed, OpeningHours, PageHeader } from "@/components/site/blocks";
import { publicContentQuery, seoHead, useContent } from "@/lib/use-content";
import { telHref } from "@/lib/content";

export const Route = createFileRoute("/kontakt")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData }) =>
    seoHead(
      loaderData?.settings.seo.contact,
      "Kontakt – Salong Ilinium",
      "/kontakt",
      loaderData?.settings.pages.contactIntro,
    ),
  component: Page,
});

function Page() {
  const c = useContent();
  const s = c.settings;
  const direct = c.staff.filter((m) => m.phone && m.phone !== s.contact.phone);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Kontakt" title={s.pages.contactTitle} intro={s.pages.contactIntro} />
      <div className="container-page grid gap-8 py-16 md:py-24 lg:grid-cols-3">
        <section className="rounded-2xl bg-card p-7 shadow-soft">
          <h2 className="text-3xl">Salongen</h2>
          <div className="mt-6">
            <ContactDetails c={s.contact} />
          </div>
        </section>
        <section className="rounded-2xl bg-card p-7 shadow-soft">
          <h2 className="text-3xl">Boka tid</h2>
          <p className="mt-4 font-medium">{s.contact.bookingInfo}</p>
          <p className="mt-1 text-sm text-muted-foreground">{s.contact.cancellation}</p>
          <ul className="mt-6 space-y-3">
            {direct.map((m) => (
              <li key={m.id}>
                <a
                  href={telHref(m.phone)}
                  className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3 hover:bg-secondary"
                >
                  <span className="font-medium">{m.name}</span>
                  <span className="flex items-center gap-2 text-sm">
                    <Phone className="size-4" />
                    {m.phone}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-card p-7 shadow-soft">
          <h2 className="text-3xl">Öppettider</h2>
          <div className="mt-4">
            <OpeningHours hours={c.hours} special={c.special} />
          </div>
        </section>
        <div className="h-96 lg:col-span-3">
          <MapEmbed c={s.contact} />
        </div>
      </div>
    </SiteLayout>
  );
}
