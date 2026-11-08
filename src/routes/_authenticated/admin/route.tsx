import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Clock,
  ExternalLink,
  FileText,
  Home,
  Images,
  LayoutGrid,
  LogOut,
  Menu,
  Phone,
  Scissors,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/site/BrandMark";
import { backend } from "@/lib/backend";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Ilinium Admin" },
      { name: "description", content: "Hantera Salong Iliniums hemsida." },
      { property: "og:title", content: "Ilinium Admin" },
      { property: "og:description", content: "Hantera Salong Iliniums hemsida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const { data } = await backend
      .from("user_roles")
      .select("role")
      .eq("user_id", context.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/ingen-behorighet" });
  },
  component: AdminLayout,
});

export const ADMIN_NAV = [
  { to: "/admin", label: "Översikt", icon: LayoutGrid, exact: true },
  { to: "/admin/startsida", label: "Startsidan", icon: Home },
  { to: "/admin/behandlingar", label: "Behandlingar & priser", icon: Scissors },
  { to: "/admin/personal", label: "Personal", icon: Users },
  { to: "/admin/galleri", label: "Bilder & galleri", icon: Images },
  { to: "/admin/oppettider", label: "Öppettider", icon: Clock },
  { to: "/admin/kontakt", label: "Kontakt & sociala medier", icon: Phone },
  { to: "/admin/texter", label: "Sidor & texter", icon: FileText },
  { to: "/admin/integritet", label: "Integritet & juridik", icon: ShieldCheck },
  { to: "/admin/seo", label: "SEO-inställningar", icon: Search },
  { to: "/admin/publicera", label: "Publicera ändringar", icon: Send },
] as const;

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await backend.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact: "exact" in n }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          activeProps={{ className: "!bg-secondary !text-foreground font-medium" }}
        >
          <n.icon className="size-4" /> {n.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Meny"
        >
          <Menu />
        </Button>
        <Link to="/admin" className="flex items-center gap-2">
          <BrandMark className="size-6" />
          <span className="font-serif text-xl">Ilinium Admin</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Home /> Tillbaka till hemsidan
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/" target="_blank" rel="noreferrer" aria-label="Öppna hemsidan i ny flik">
              <ExternalLink />
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut /> <span className="hidden sm:inline">Logga ut</span>
          </Button>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-card p-4 lg:block">
          {nav}
        </aside>
        {open && (
          <div className="fixed inset-x-0 top-14 z-20 border-b border-border bg-card p-4 shadow-soft lg:hidden">
            {nav}
          </div>
        )}
        <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
