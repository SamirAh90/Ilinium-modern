import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ADMIN_NAV } from "./route";
import { draftQuery, publishedQuery } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const draft = useQuery(draftQuery);
  const pub = useQuery(publishedQuery);
  const unpublished =
    draft.data &&
    pub.data &&
    JSON.stringify(draft.data.content) !== JSON.stringify(pub.data.content);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl">Välkommen</h1>
      <p className="mt-1 text-muted-foreground">Välj vad du vill ändra på hemsidan.</p>
      {unpublished && (
        <Link to="/admin/publicera" className="mt-6 block rounded-2xl bg-accent/50 p-4 text-sm">
          Det finns sparade textändringar som inte är publicerade ännu.{" "}
          <span className="underline">Granska och publicera →</span>
        </Link>
      )}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {ADMIN_NAV.slice(1).map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition hover:border-taupe hover:shadow-soft"
          >
            <n.icon className="size-6 text-taupe" strokeWidth={1.5} />
            <span className="text-sm font-medium">{n.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Så fungerar det</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Priser, personal, bilder och öppettider sparas och syns på hemsidan direkt.</li>
          <li>
            Texter (startsida, sidor, kontakt, SEO) sparas som utkast. Förhandsgranska och tryck
            sedan <strong>Publicera</strong>.
          </li>
          <li>Tidigare publicerade versioner kan återställas under "Publicera ändringar".</li>
        </ul>
      </div>
    </div>
  );
}
