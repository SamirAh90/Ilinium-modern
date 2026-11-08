import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, Phone, X, Facebook, Instagram, MapPin, Mail, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/use-content";
import { telHref } from "@/lib/content";

const NAV = [
  { to: "/", label: "Hem" },
  { to: "/behandlingar", label: "Behandlingar & priser" },
  { to: "/frisorer", label: "Våra frisörer" },
  { to: "/galleri", label: "Galleri" },
  { to: "/om-oss", label: "Om oss" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex flex-col leading-none" aria-label="Salong Ilinium – startsida">
      <span className="font-serif text-2xl tracking-wide text-gold">Ilinium</span>
      <span className="eyebrow mt-0.5 !text-[0.6rem]">Salong · Kungsholmen</span>
    </Link>
  );
}

function Sprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 200"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="var(--wine)"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M60 195 C58 150 62 110 60 20" />
      {[150, 120, 90, 60].map((y, i) => (
        <g key={y}>
          <path
            d={`M60 ${y} C${40 - i * 2} ${y - 6} ${30 - i * 2} ${y - 22} 34 ${y - 30} C46 ${y - 26} 56 ${y - 14} 60 ${y}`}
          />
          <path
            d={`M60 ${y - 12} C${80 + i * 2} ${y - 18} ${90 + i * 2} ${y - 34} 86 ${y - 42} C74 ${y - 38} 64 ${y - 26} 60 ${y - 12}`}
          />
        </g>
      ))}
      <circle cx="60" cy="16" r="7" />
      <circle cx="60" cy="16" r="2.5" fill="var(--wine)" />
    </svg>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { settings, preview } = useContent();
  const [open, setOpen] = useState(false);
  const phone = settings.contact.phone;

  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      {preview && (
        <div className="bg-accent px-4 py-2 text-center text-sm">
          <Eye className="mr-1 inline size-4" /> Förhandsgranskning av opublicerade texter
        </div>
      )}
      {settings.announcement.enabled && settings.announcement.text && (
        <div className="bg-ink px-4 py-2 text-center text-sm text-ink-foreground">
          {settings.announcement.text}
        </div>
      )}
      <header className="night sticky top-0 z-40 border-b border-border !bg-ink/95 backdrop-blur">
        <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Huvudmeny">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm text-body/80 transition-colors duration-500 hover:text-gold"
                activeProps={{ className: "!text-gold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="salon-gold" size="xl" className="hidden sm:inline-flex">
              <a href={telHref(phone)}>
                <Phone /> Boka tid
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Stäng meny" : "Öppna meny"}
              aria-expanded={open}
            >
              {open ? <X className="!size-5" /> : <Menu className="!size-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border lg:hidden" aria-label="Mobilmeny">
            <div className="container-page flex flex-col py-3">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3.5 font-serif text-xl text-body last:border-0"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <Sprig className="pointer-events-none fixed -left-6 top-28 z-0 w-20 -rotate-12 opacity-20 sm:w-28 lg:w-36" />
      <Sprig className="pointer-events-none fixed -right-6 bottom-24 z-0 w-20 rotate-[160deg] opacity-20 sm:w-28 md:bottom-10 lg:w-36" />
      <main className="relative z-10 flex-1">{children}</main>

      <footer className="night relative z-10">
        <div className="container-page grid gap-10 py-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-serif text-3xl">Salong Ilinium</p>
            <p className="mt-3 max-w-sm text-sm opacity-75">{settings.footer.tagline}</p>
            <div className="mt-6 flex gap-3">
              {settings.social.facebook && (
                <a
                  href={settings.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Salong Ilinium på Facebook"
                  className="rounded-full border border-ink-foreground/25 p-2.5 hover:bg-ink-foreground/10"
                >
                  <Facebook className="size-4" />
                </a>
              )}
              {settings.social.instagramJasmine && (
                <a
                  href={settings.social.instagramJasmine}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Jasmine på Instagram"
                  className="rounded-full border border-ink-foreground/25 p-2.5 hover:bg-ink-foreground/10"
                >
                  <Instagram className="size-4" />
                </a>
              )}
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <p className="eyebrow !text-ink-foreground/60">Kontakt</p>
            <a
              href={settings.contact.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex gap-2 opacity-85 hover:opacity-100"
            >
              <MapPin className="size-4 shrink-0" />
              {settings.contact.street}, {settings.contact.postal}
            </a>
            <a href={telHref(phone)} className="flex gap-2 opacity-85 hover:opacity-100">
              <Phone className="size-4" />
              {phone}
            </a>
            <a
              href={`mailto:${settings.contact.email}`}
              className="flex gap-2 opacity-85 hover:opacity-100"
            >
              <Mail className="size-4" />
              {settings.contact.email}
            </a>
          </div>
          <nav className="flex flex-col gap-2 text-sm" aria-label="Sidfot">
            <p className="eyebrow !text-ink-foreground/60">Sidor</p>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="opacity-85 hover:opacity-100">
                {n.label}
              </Link>
            ))}
            <Link
              to="/integritet"
              className="flex min-h-12 items-center opacity-85 hover:opacity-100"
            >
              {settings.legal?.title ?? "Integritet & juridisk information"}
            </Link>
          </nav>
        </div>
        <div className="border-t border-ink-foreground/10">
          <div className="container-page flex justify-between py-5 text-xs opacity-60">
            <span>© Salong Ilinium {new Date().getFullYear()}</span>
            <Link to="/admin" className="hover:opacity-100">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      <div className="night fixed inset-x-0 bottom-0 z-40 border-t border-border !bg-ink/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <Button
          asChild
          variant="salon-gold"
          size="xl"
          className="min-h-12 w-full text-base font-medium"
        >
          <a href={telHref(phone)}>
            <Phone /> Ring och boka tid · {phone}
          </a>
        </Button>
      </div>
    </div>
  );
}
