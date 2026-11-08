import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import {
  AdminPage,
  Card,
  DraftBar,
  Field,
  ImageInput,
  Loading,
  MoveButtons,
  useDraftEditor,
} from "@/components/admin/ui";
import { SECTION_LABELS } from "@/lib/content";
import heroImg from "@/assets/hero-salon.jpg";
import introImg from "@/assets/intro-styling.jpg";

export const Route = createFileRoute("/_authenticated/admin/startsida")({ component: Page });

function Page() {
  const ed = useDraftEditor();
  const c = ed.content;
  if (!c) return <Loading />;
  const u = ed.update;
  return (
    <AdminPage
      title="Redigera startsidan"
      description="Utvalda behandlingar väljer du under Behandlingar & priser (stjärnmarkera)."
    >
      <Card title="Tillfälligt meddelande / kampanj">
        <div className="flex items-center gap-3">
          <Switch
            checked={c.announcement.enabled}
            onCheckedChange={(v) =>
              u((d) => {
                d.announcement.enabled = v;
              })
            }
          />{" "}
          <span className="text-sm">Visa meddelande högst upp på alla sidor</span>
        </div>
        <Field
          label="Meddelande"
          value={c.announcement.text}
          maxLength={200}
          onChange={(v) =>
            u((d) => {
              d.announcement.text = v;
            })
          }
        />
      </Card>
      <Card title="Toppsektion">
        <Field
          label="Liten rubrik"
          value={c.hero.eyebrow}
          onChange={(v) =>
            u((d) => {
              d.hero.eyebrow = v;
            })
          }
        />
        <Field
          label="Huvudrubrik"
          value={c.hero.title}
          maxLength={120}
          onChange={(v) =>
            u((d) => {
              d.hero.title = v;
            })
          }
        />
        <Field
          label="Beskrivning"
          multiline
          value={c.hero.text}
          maxLength={500}
          onChange={(v) =>
            u((d) => {
              d.hero.text = v;
            })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Knapptext (ring)"
            value={c.hero.ctaPrimary}
            maxLength={40}
            onChange={(v) =>
              u((d) => {
                d.hero.ctaPrimary = v;
              })
            }
          />
          <Field
            label="Knapptext (behandlingar)"
            value={c.hero.ctaSecondary}
            maxLength={40}
            onChange={(v) =>
              u((d) => {
                d.hero.ctaSecondary = v;
              })
            }
          />
        </div>
        <ImageInput
          label="Huvudbild"
          folder="hero"
          value={c.hero.image}
          fallback={heroImg}
          onChange={(v) =>
            u((d) => {
              d.hero.image = v;
            })
          }
        />
      </Card>
      <Card title="Introduktion">
        <Field
          label="Rubrik"
          value={c.intro.title}
          onChange={(v) =>
            u((d) => {
              d.intro.title = v;
            })
          }
        />
        <Field
          label="Text"
          multiline
          value={c.intro.text}
          onChange={(v) =>
            u((d) => {
              d.intro.text = v;
            })
          }
        />
        <ImageInput
          label="Bild"
          folder="intro"
          value={c.intro.image}
          fallback={introImg}
          onChange={(v) =>
            u((d) => {
              d.intro.image = v;
            })
          }
        />
      </Card>
      <Card title="Rubriker för sektioner">
        <Field
          label="Behandlingar"
          value={c.treatmentsSection.title}
          onChange={(v) =>
            u((d) => {
              d.treatmentsSection.title = v;
            })
          }
        />
        <Field
          label="Frisörer – rubrik"
          value={c.teamSection.title}
          onChange={(v) =>
            u((d) => {
              d.teamSection.title = v;
            })
          }
        />
        <Field
          label="Frisörer – underrubrik"
          value={c.teamSection.subtitle}
          onChange={(v) =>
            u((d) => {
              d.teamSection.subtitle = v;
            })
          }
        />
        <Field
          label="Galleri"
          value={c.gallerySection.title}
          onChange={(v) =>
            u((d) => {
              d.gallerySection.title = v;
            })
          }
        />
      </Card>
      <Card title="Varför välja Ilinium?">
        <Field
          label="Rubrik"
          value={c.why.title}
          onChange={(v) =>
            u((d) => {
              d.why.title = v;
            })
          }
        />
        {c.why.items.map((it, i) => (
          <div key={i} className="grid gap-3 rounded-xl bg-muted/50 p-3 sm:grid-cols-2">
            <Field
              label={`Punkt ${i + 1} – rubrik`}
              value={it.title}
              onChange={(v) =>
                u((d) => {
                  d.why.items[i].title = v;
                })
              }
            />
            <Field
              label="Text"
              value={it.text}
              onChange={(v) =>
                u((d) => {
                  d.why.items[i].text = v;
                })
              }
            />
          </div>
        ))}
      </Card>
      <Card title="Avslutande uppmaning">
        <Field
          label="Rubrik"
          value={c.cta.title}
          onChange={(v) =>
            u((d) => {
              d.cta.title = v;
            })
          }
        />
        <Field
          label="Text"
          value={c.cta.text}
          onChange={(v) =>
            u((d) => {
              d.cta.text = v;
            })
          }
        />
      </Card>
      <Card title="Visa, dölj och ordna sektioner">
        <ul className="divide-y divide-border">
          {c.sectionOrder.map((k, i) => (
            <li key={k} className="flex items-center gap-3 py-2">
              <MoveButtons
                disableUp={i === 0}
                disableDown={i === c.sectionOrder.length - 1}
                onUp={() =>
                  u((d) => {
                    [d.sectionOrder[i - 1], d.sectionOrder[i]] = [
                      d.sectionOrder[i],
                      d.sectionOrder[i - 1],
                    ];
                  })
                }
                onDown={() =>
                  u((d) => {
                    [d.sectionOrder[i + 1], d.sectionOrder[i]] = [
                      d.sectionOrder[i],
                      d.sectionOrder[i + 1],
                    ];
                  })
                }
              />
              <span className="flex-1 text-sm">{SECTION_LABELS[k]}</span>
              <Switch
                checked={c.sections[k]}
                onCheckedChange={(v) =>
                  u((d) => {
                    d.sections[k] = v;
                  })
                }
                aria-label={`Visa ${SECTION_LABELS[k]}`}
              />
            </li>
          ))}
        </ul>
      </Card>
      <DraftBar editor={ed} />
    </AdminPage>
  );
}
