import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, Card, DraftBar, Field, Loading, useDraftEditor } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/kontakt")({ component: Page });

function Page() {
  const ed = useDraftEditor();
  const c = ed.content;
  if (!c) return <Loading />;
  const u = ed.update;
  return (
    <AdminPage
      title="Kontaktuppgifter och sociala medier"
      description="Frisörernas egna nummer ändrar du under Personal."
    >
      <Card title="Salongen">
        <Field
          label="Gatuadress"
          value={c.contact.street}
          onChange={(v) =>
            u((d) => {
              d.contact.street = v;
            })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Postnummer och ort"
            value={c.contact.postal}
            onChange={(v) =>
              u((d) => {
                d.contact.postal = v;
              })
            }
          />
          <Field
            label="Område"
            value={c.contact.area}
            onChange={(v) =>
              u((d) => {
                d.contact.area = v;
              })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Huvudnummer"
            type="tel"
            value={c.contact.phone}
            onChange={(v) =>
              u((d) => {
                d.contact.phone = v;
              })
            }
          />
          <Field
            label="E-post"
            type="email"
            value={c.contact.email}
            onChange={(v) =>
              u((d) => {
                d.contact.email = v;
              })
            }
          />
        </div>
        <Field
          label="Google Maps-länk"
          value={c.contact.mapsUrl}
          onChange={(v) =>
            u((d) => {
              d.contact.mapsUrl = v;
            })
          }
        />
      </Card>
      <Card title="Bokning">
        <Field
          label="Bokningsinstruktion"
          value={c.contact.bookingInfo}
          onChange={(v) =>
            u((d) => {
              d.contact.bookingInfo = v;
            })
          }
        />
        <Field
          label="Avbokningsregler"
          value={c.contact.cancellation}
          onChange={(v) =>
            u((d) => {
              d.contact.cancellation = v;
            })
          }
        />
      </Card>
      <Card title="Sociala medier">
        <Field
          label="Facebook – Salong Ilinium"
          value={c.social.facebook}
          onChange={(v) =>
            u((d) => {
              d.social.facebook = v;
            })
          }
        />
        <Field
          label="Facebook – Linda"
          value={c.social.facebookLinda}
          onChange={(v) =>
            u((d) => {
              d.social.facebookLinda = v;
            })
          }
        />
        <Field
          label="Instagram – Jasmine"
          value={c.social.instagramJasmine}
          onChange={(v) =>
            u((d) => {
              d.social.instagramJasmine = v;
            })
          }
        />
        <Field
          label="Instagram – Linda"
          value={c.social.instagramLinda ?? ""}
          onChange={(v) =>
            u((d) => {
              d.social.instagramLinda = v;
            })
          }
        />
        <Field
          label="Befintlig hemsida"
          value={c.social.website ?? ""}
          onChange={(v) =>
            u((d) => {
              d.social.website = v;
            })
          }
        />
      </Card>
      <DraftBar editor={ed} previewPath="/kontakt" />
    </AdminPage>
  );
}
