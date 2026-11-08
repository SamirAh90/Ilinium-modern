import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Facebook, Instagram, MapPin, Mail, Navigation, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  WEEKDAYS,
  formatHourRow,
  formatPrice,
  paragraphs,
  telHref,
  upcomingSpecial,
  type Category,
  type GalleryImage,
  type OpeningHour,
  type SiteContent,
  type SpecialHour,
  type Staff,
  type Treatment,
} from "@/lib/content";
import introImg from "@/assets/intro-styling.jpg";

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="night border-b border-border">
      <div className="container-page py-16 md:py-24">
        {eyebrow && <p className="eyebrow fade-up">{eyebrow}</p>}
        <h1 className="fade-up mt-3 max-w-3xl text-5xl md:text-6xl">{title}</h1>
        {intro && <p className="fade-up mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 text-4xl md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function CallButton({
  phone,
  label = "Ring och boka",
  variant = "salon" as const,
  className,
}: {
  phone: string;
  label?: string;
  variant?: "salon" | "salon-outline" | "salon-light" | "salon-gold";
  className?: string;
}) {
  return (
    <Button asChild variant={variant} size="xl" className={className}>
      <a href={telHref(phone)}>
        <Phone /> {label}
      </a>
    </Button>
  );
}

export function TreatmentCard({ t, phone }: { t: Treatment; phone: string }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft">
      <div className="aspect-[4/3] overflow-hidden bg-champagne">
        <img
          src={t.image_url || introImg}
          alt={t.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl">{t.name}</h3>
        {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
        <p className="mt-4 text-xl font-medium">{formatPrice(t.price, t.price_from)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            to="/behandlingar"
            className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
          >
            Läs mer <ArrowRight className="size-3.5" />
          </Link>
          <a
            href={telHref(phone)}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm hover:bg-champagne"
          >
            <Phone className="size-3.5" /> Ring och boka
          </a>
        </div>
      </div>
    </article>
  );
}

export function PriceList({
  categories,
  treatments,
  phone,
}: {
  categories: Category[];
  treatments: Treatment[];
  phone: string;
}) {
  const groups = [
    ...categories.map((c) => ({
      name: c.name,
      items: treatments.filter((t) => t.category_id === c.id),
    })),
    {
      name: "Övrigt",
      items: treatments.filter(
        (t) => !t.category_id || !categories.some((c) => c.id === t.category_id),
      ),
    },
  ].filter((g) => g.items.length);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {groups.map((g) => (
        <section key={g.name} className="rounded-2xl bg-card p-7 shadow-soft md:p-9">
          <h2 className="text-3xl">{g.name}</h2>
          <ul className="mt-6 divide-y divide-border">
            {g.items.map((t) => (
              <li key={t.id} className="flex items-baseline justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{t.name}</p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <p className="shrink-0 font-serif text-2xl">{formatPrice(t.price, t.price_from)}</p>
              </li>
            ))}
          </ul>
          <CallButton phone={phone} className="mt-6" />
        </section>
      ))}
    </div>
  );
}

export function TeamCard({ s }: { s: Staff }) {
  return (
    <article className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-soft">
      <div className="size-36 overflow-hidden rounded-full bg-champagne ring-4 ring-champagne/60">
        {s.image_url ? (
          <img
            src={s.image_url}
            alt={`Porträtt av ${s.name}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif text-5xl text-taupe">
            {s.name[0]}
          </div>
        )}
      </div>
      <h3 className="mt-5 text-3xl">{s.name}</h3>
      <p className="eyebrow mt-1">{s.role}</p>
      {s.bio && <p className="mt-4 text-sm text-muted-foreground">{s.bio}</p>}
      {s.phone && (
        <a
          href={telHref(s.phone)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:bg-primary/85"
        >
          <Phone className="size-4" /> Ring {s.name} · {s.phone}
        </a>
      )}
      <div className="mt-4 flex gap-3">
        {s.facebook_url && (
          <a
            href={s.facebook_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${s.name} på Facebook`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Facebook className="size-4" />
          </a>
        )}
        {s.instagram_url && (
          <a
            href={s.instagram_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${s.name} på Instagram`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Instagram className="size-4" />
          </a>
        )}
      </div>
    </article>
  );
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryImage | null>(null);
  if (!images.length) return <p className="text-muted-foreground">Inga bilder ännu.</p>;
  return (
    <>
      <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setActive(img)}
            className="group block w-full overflow-hidden rounded-xl bg-champagne focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Visa större: ${img.alt}`}
          >
            <img
              src={img.url}
              alt={img.alt}
              loading="lazy"
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {img.caption && (
              <span className="block bg-card px-3 py-2 text-left text-xs text-muted-foreground">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl border-0 bg-card p-2">
          <DialogTitle className="sr-only">{active?.alt}</DialogTitle>
          {active && (
            <figure>
              <img
                src={active.url}
                alt={active.alt}
                className="max-h-[80vh] w-full rounded-lg object-contain"
              />
              {active.caption && (
                <figcaption className="p-3 text-sm text-muted-foreground">
                  {active.caption}
                </figcaption>
              )}
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function OpeningHours({
  hours,
  special,
  note,
}: {
  hours: OpeningHour[];
  special: SpecialHour[];
  note?: string;
}) {
  const todayIdx = ((new Date().getDay() + 6) % 7) + 1;
  const upcoming = upcomingSpecial(special);
  return (
    <div>
      <ul className="divide-y divide-border">
        {hours.map((h) => (
          <li
            key={h.weekday}
            className={`flex justify-between py-2.5 text-sm ${h.weekday === todayIdx ? "font-semibold" : ""}`}
          >
            <span>{WEEKDAYS[h.weekday - 1]}</span>
            <span className={h.closed ? "text-muted-foreground" : ""}>{formatHourRow(h)}</span>
          </li>
        ))}
      </ul>
      {upcoming.length > 0 && (
        <div className="mt-5 rounded-xl bg-accent/40 p-4 text-sm">
          <p className="font-medium">Avvikande öppettider</p>
          <ul className="mt-2 space-y-1">
            {upcoming.map((s) => (
              <li key={s.id} className="flex justify-between gap-3">
                <span>
                  {new Date(s.date + "T12:00").toLocaleDateString("sv-SE", {
                    day: "numeric",
                    month: "long",
                  })}
                  {s.label ? ` · ${s.label}` : ""}
                </span>
                <span>{formatHourRow(s)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {note && <p className="mt-4 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function ContactDetails({ c }: { c: SiteContent["contact"] }) {
  return (
    <div className="space-y-4">
      <a href={c.mapsUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:underline">
        <MapPin className="mt-0.5 size-5 shrink-0 text-taupe" />
        <span>
          Salong Ilinium
          <br />
          {c.street}
          <br />
          {c.postal}
        </span>
      </a>
      <a href={telHref(c.phone)} className="flex gap-3 text-lg hover:underline">
        <Phone className="mt-1 size-5 text-taupe" />
        {c.phone}
      </a>
      <a href={`mailto:${c.email}`} className="flex gap-3 hover:underline">
        <Mail className="mt-0.5 size-5 text-taupe" />
        {c.email}
      </a>
      <Button asChild variant="salon-outline" size="xl">
        <a href={c.mapsUrl} target="_blank" rel="noreferrer">
          <Navigation /> Vägbeskrivning
        </a>
      </Button>
    </div>
  );
}

export function MapEmbed({ c }: { c: SiteContent["contact"] }) {
  const q = encodeURIComponent(`${c.street}, ${c.postal}`);
  return (
    <iframe
      title={`Karta till ${c.street}`}
      src={`https://www.google.com/maps?q=${q}&output=embed`}
      loading="lazy"
      className="h-full min-h-80 w-full rounded-2xl border-0 grayscale-[30%]"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export function CtaBand({ title, text, phone }: { title: string; text: string; phone: string }) {
  return (
    <section className="night">
      <div className="container-page py-16 text-center md:py-28">
        <h2 className="mx-auto max-w-2xl text-4xl md:text-6xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-lg text-muted-foreground">{text}</p>
        <CallButton
          phone={phone}
          variant="salon-gold"
          label={`Ring oss på ${phone}`}
          className="mt-9"
        />
      </div>
    </section>
  );
}

export function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
      {paragraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
