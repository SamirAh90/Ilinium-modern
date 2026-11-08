import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, Card, DraftBar, Field, Loading, useDraftEditor } from "@/components/admin/ui";
import type { SiteContent } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/seo")({ component: Page });

const PAGES: { key: keyof SiteContent["seo"]; label: string }[] = [
  { key: "home", label: "Startsidan" },
  { key: "treatments", label: "Behandlingar & priser" },
  { key: "team", label: "Våra frisörer" },
  { key: "gallery", label: "Galleri" },
  { key: "about", label: "Om oss" },
  { key: "contact", label: "Kontakt" },
  { key: "legal", label: "Integritet & juridisk information" },
];

function Page() {
  const ed = useDraftEditor();
  const c = ed.content;
  if (!c) return <Loading />;
  return (
    <AdminPage
      title="SEO-inställningar"
      description="Titel och beskrivning som visas i Google och när sidan delas."
    >
      {PAGES.map(({ key, label }) => (
        <Card key={key} title={label}>
          <Field
            label="Sidtitel"
            value={c.seo[key]?.title ?? ""}
            maxLength={70}
            hint={`${c.seo[key]?.title.length ?? 0}/60 tecken rekommenderas`}
            onChange={(v) =>
              ed.update((d) => {
                d.seo[key] = { title: v, description: d.seo[key]?.description ?? "" };
              })
            }
          />
          <Field
            label="Beskrivning"
            multiline
            value={c.seo[key]?.description ?? ""}
            maxLength={200}
            hint={`${c.seo[key]?.description.length ?? 0}/160 tecken rekommenderas`}
            onChange={(v) =>
              ed.update((d) => {
                d.seo[key] = { title: d.seo[key]?.title ?? "", description: v };
              })
            }
          />
        </Card>
      ))}
      <DraftBar editor={ed} />
    </AdminPage>
  );
}
