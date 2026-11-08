import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { AdminPage, Card, DraftBar, Field, Loading, useDraftEditor } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/texter")({ component: Page });

const HINT = "Ny rad = nytt stycke.";

function Page() {
  const ed = useDraftEditor();
  const c = ed.content;
  if (!c) return <Loading />;
  const u = ed.update;
  const p = c.pages;
  return (
    <AdminPage
      title="Sidor och texter"
      description="Texterna visas med salongens typsnitt och layout."
    >
      <Card title="Behandlingar & priser">
        <Field
          label="Rubrik"
          value={p.treatmentsTitle}
          onChange={(v) =>
            u((d) => {
              d.pages.treatmentsTitle = v;
            })
          }
        />
        <Field
          label="Ingress"
          multiline
          value={p.treatmentsIntro}
          onChange={(v) =>
            u((d) => {
              d.pages.treatmentsIntro = v;
            })
          }
        />
        <Field
          label="Bra att veta (en punkt per rad)"
          multiline
          value={p.treatmentsTerms}
          onChange={(v) =>
            u((d) => {
              d.pages.treatmentsTerms = v;
            })
          }
        />
      </Card>
      <Card title="Våra frisörer">
        <Field
          label="Rubrik"
          value={p.teamTitle}
          onChange={(v) =>
            u((d) => {
              d.pages.teamTitle = v;
            })
          }
        />
        <Field
          label="Ingress"
          multiline
          value={p.teamIntro}
          onChange={(v) =>
            u((d) => {
              d.pages.teamIntro = v;
            })
          }
        />
      </Card>
      <Card title="Galleri">
        <Field
          label="Rubrik"
          value={p.galleryTitle}
          onChange={(v) =>
            u((d) => {
              d.pages.galleryTitle = v;
            })
          }
        />
        <Field
          label="Ingress"
          value={p.galleryIntro}
          onChange={(v) =>
            u((d) => {
              d.pages.galleryIntro = v;
            })
          }
        />
      </Card>
      <Card title="Om oss">
        <Field
          label="Rubrik"
          value={p.aboutTitle}
          onChange={(v) =>
            u((d) => {
              d.pages.aboutTitle = v;
            })
          }
        />
        <Field
          label="Text"
          multiline
          hint={HINT}
          value={p.aboutText}
          onChange={(v) =>
            u((d) => {
              d.pages.aboutText = v;
            })
          }
        />
      </Card>
      <Card title="Kontakt">
        <Field
          label="Rubrik"
          value={p.contactTitle}
          onChange={(v) =>
            u((d) => {
              d.pages.contactTitle = v;
            })
          }
        />
        <Field
          label="Ingress"
          multiline
          value={p.contactIntro}
          onChange={(v) =>
            u((d) => {
              d.pages.contactIntro = v;
            })
          }
        />
      </Card>
      <Card title="Hudvård (dold tills tjänsten finns)">
        <div className="flex items-center gap-3">
          <Switch
            checked={c.skincare.enabled}
            onCheckedChange={(v) =>
              u((d) => {
                d.skincare.enabled = v;
              })
            }
          />
          <span className="text-sm">Visa hudvård på hemsidan</span>
        </div>
        <Field
          label="Rubrik"
          value={c.skincare.title}
          onChange={(v) =>
            u((d) => {
              d.skincare.title = v;
            })
          }
        />
        <Field
          label="Text"
          multiline
          value={c.skincare.text}
          onChange={(v) =>
            u((d) => {
              d.skincare.text = v;
            })
          }
        />
      </Card>
      <Card title="Sidfot">
        <Field
          label="Text i sidfoten"
          value={c.footer.tagline}
          onChange={(v) =>
            u((d) => {
              d.footer.tagline = v;
            })
          }
        />
      </Card>
      <DraftBar editor={ed} />
    </AdminPage>
  );
}
