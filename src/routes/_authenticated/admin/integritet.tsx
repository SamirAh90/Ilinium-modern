import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, Card, DraftBar, Field, Loading, useDraftEditor } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/integritet")({ component: Page });

const HINT = "Ny rad = nytt stycke.";

function Page() {
  const ed = useDraftEditor();
  const c = ed.content;
  if (!c) return <Loading />;
  const u = ed.update;
  return (
    <AdminPage
      title="Integritet & juridisk information"
      description="Texten visas på sidan som länkas i hemsidans sidfot."
    >
      {c.legal ? (
        <>
          <Card title="Sidhuvud">
            <Field
              label="Rubrik"
              value={c.legal.title}
              onChange={(v) =>
                u((d) => {
                  if (d.legal) d.legal.title = v;
                })
              }
            />
            <Field
              label="Ingress"
              multiline
              value={c.legal.intro}
              onChange={(v) =>
                u((d) => {
                  if (d.legal) d.legal.intro = v;
                })
              }
            />
          </Card>
          {c.legal.sections.map((section, index) => (
            <Card key={index} title={section.title || `Avsnitt ${index + 1}`}>
              <Field
                label="Avsnittsrubrik"
                value={section.title}
                onChange={(v) =>
                  u((d) => {
                    const s = d.legal?.sections[index];
                    if (s) s.title = v;
                  })
                }
              />
              <Field
                label="Text"
                multiline
                hint={HINT}
                value={section.text}
                onChange={(v) =>
                  u((d) => {
                    const s = d.legal?.sections[index];
                    if (s) s.text = v;
                  })
                }
              />
            </Card>
          ))}
        </>
      ) : (
        <Card title="Ingen text ännu">
          <p className="text-sm text-muted-foreground">
            Det finns ingen juridisk text att redigera.
          </p>
        </Card>
      )}
      <DraftBar editor={ed} />
    </AdminPage>
  );
}
