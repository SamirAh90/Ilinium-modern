import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, HeartHandshake, MapPin, Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  CallButton,
  ContactDetails,
  CtaBand,
  GalleryGrid,
  MapEmbed,
  OpeningHours,
  SectionTitle,
  TeamCard,
  TreatmentCard,
} from "@/components/site/blocks";
import { publicContentQuery, seoHead, useContent } from "@/lib/use-content";
import type { SectionKey } from "@/lib/content";
import { salonSchema } from "@/lib/seo";
import heroImg from "@/assets/hero-salon.jpg";
import introImg from "@/assets/intro-styling.jpg";
import heroVideo from "@/assets/salong-hero.mp4.asset.json";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData }) => {
    const s = loaderData?.settings;
    const base = seoHead(s?.seo.home, "Salong Ilinium – Frisör på Kungsholmen", "/", s?.hero.text);
    if (!loaderData) return base;
    const ld = salonSchema(loaderData);
    return { ...base, scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }] };
  },
  component: Home,
});

function Home() {
  const c = useContent();
  const s = c.settings;
  const phone = s.contact.phone;
  const heroIsVideo = !!s.hero.image && /\.(mp4|webm|mov)$/i.test(s.hero.image);
  const featured = c.treatments.filter((t) => t.featured).slice(0, 4);
  const whyIcons = [Clock, HeartHandshake, Sparkles];

  const blocks: Record<SectionKey, React.ReactNode> = {
    intro: (
      <section className="container-page grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div className="order-2 md:order-1">
          <SectionTitle eyebrow="Om salongen" title={s.intro.title} />
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{s.intro.text}</p>
          <Button asChild variant="salon-outline" size="xl" className="mt-8">
            <Link to="/om-oss">Mer om oss</Link>
          </Button>
        </div>
        <img
          src={s.intro.image || introImg}
          alt="Frisör som klipper hår"
          loading="lazy"
          width={1200}
          height={1400}
          className="order-1 aspect-[4/5] w-full rounded-2xl object-cover shadow-soft md:order-2"
        />
      </section>
    ),
    treatments: featured.length > 0 && (
      <section className="bg-secondary py-16 md:py-28">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow="Behandlingar" title={s.treatmentsSection.title} />
            <Button asChild variant="salon-outline" size="xl">
              <Link to="/behandlingar">Hela prislistan</Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((t) => (
              <TreatmentCard key={t.id} t={t} phone={phone} />
            ))}
          </div>
        </div>
      </section>
    ),
    team: c.staff.length > 0 && (
      <section className="night">
        <div className="container-page py-16 md:py-28">
          <SectionTitle
            center
            eyebrow="Teamet"
            title={s.teamSection.title}
            subtitle={s.teamSection.subtitle}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {c.staff.map((m) => (
              <TeamCard key={m.id} s={m} />
            ))}
          </div>
        </div>
      </section>
    ),
    gallery: c.gallery.length > 0 && (
      <section className="night py-16 md:py-28">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow="Galleri" title={s.gallerySection.title} />
            <Button asChild variant="salon-outline" size="xl">
              <Link to="/galleri">Se hela galleriet</Link>
            </Button>
          </div>
          <div className="mt-12">
            <GalleryGrid images={c.gallery.slice(0, 6)} />
          </div>
        </div>
      </section>
    ),
    why: (
      <section className="container-page py-16 md:py-28">
        <SectionTitle center title={s.why.title} />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {s.why.items.map((it, i) => {
            const Icon = whyIcons[i % 3];
            return (
              <div key={i} className="text-center">
                <Icon className="mx-auto size-7 text-taupe" strokeWidth={1.3} />
                <h3 className="mt-4 text-3xl">{it.title}</h3>
                <p className="mt-2 text-muted-foreground">{it.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    ),
    location: (
      <section className="bg-secondary py-16 md:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1fr_1.3fr]">
          <div>
            <SectionTitle eyebrow="Kontakt" title="Hitta till oss" />
            <div className="mt-8">
              <ContactDetails c={s.contact} />
            </div>
          </div>
          <div>
            <p className="eyebrow">Öppettider</p>
            <div className="mt-4">
              <OpeningHours hours={c.hours} special={c.special} />
            </div>
          </div>
          <MapEmbed c={s.contact} />
        </div>
      </section>
    ),
    cta: <CtaBand title={s.cta.title} text={s.cta.text} phone={phone} />,
  };

  return (
    <SiteLayout>
      <section className="night relative overflow-hidden">
        <div className="container-page relative z-10 grid items-center gap-8 pb-10 pt-8 md:grid-cols-[1.05fr_1fr] md:gap-16 md:pb-24 md:pt-16">
          <div className="fade-up">
            <p className="eyebrow">{s.hero.eyebrow}</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.02] sm:text-5xl md:text-7xl">
              {s.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-body/90 md:text-lg">
              {s.hero.text}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CallButton
                phone={phone}
                label={s.hero.ctaPrimary}
                variant="salon-gold"
                className="min-h-12"
              />
              <Button
                asChild
                variant="salon-outline"
                size="xl"
                className="border-gold/50 text-gold hover:bg-gold hover:text-ink"
              >
                <Link to="/behandlingar">{s.hero.ctaSecondary}</Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-gold" /> {s.contact.street} · {s.contact.area}
            </p>
          </div>
          <div className="relative">
            <div className="glow-in relative overflow-hidden rounded-[2rem] ring-1 ring-gold/25 shadow-soft">
              {heroIsVideo ? (
                <video
                  src={s.hero.image || heroVideo.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="aspect-[4/3] w-full object-cover md:aspect-[4/5]"
                />
              ) : (
                <img
                  src={s.hero.image || heroImg}
                  alt="Salongsmiljö hos Salong Ilinium"
                  width={1280}
                  height={1600}
                  fetchPriority="high"
                  className="aspect-[4/3] w-full object-cover md:aspect-[4/5]"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-wine/20 to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-card px-6 py-4 shadow-soft md:block">
              <p className="font-serif text-3xl text-gold">2006</p>
              <p className="eyebrow">På Kungsholmen sedan</p>
            </div>
          </div>
        </div>
        {c.categories.length > 0 && (
          <div className="relative z-10 border-t border-border">
            <div className="container-page flex gap-3 overflow-x-auto py-4 [scrollbar-width:none]">
              {c.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to="/behandlingar"
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-gold/40 px-5 text-sm tracking-wide text-gold transition-colors duration-500 hover:bg-gold/10"
                >
                  <Scissors className="size-4" strokeWidth={1.3} /> {cat.name}
                </Link>
              ))}
              <Link
                to="/behandlingar"
                className="inline-flex min-h-11 shrink-0 items-center px-3 text-sm text-body/80 underline-offset-4 hover:underline"
              >
                Alla priser →
              </Link>
            </div>
          </div>
        )}
      </section>

      {s.sectionOrder
        .filter((k) => s.sections[k])
        .map((k) => (
          <div key={k}>{blocks[k]}</div>
        ))}

      {s.skincare.enabled && (
        <section className="container-page py-16 text-center">
          <SectionTitle center title={s.skincare.title} subtitle={s.skincare.text} />
        </section>
      )}
    </SiteLayout>
  );
}
