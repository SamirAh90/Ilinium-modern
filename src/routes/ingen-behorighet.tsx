import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ingen-behorighet")({
  head: () => ({
    meta: [
      { title: "Ingen behörighet – Salong Ilinium" },
      { name: "description", content: "Kontot saknar administratörsbehörighet." },
      { property: "og:title", content: "Ingen behörighet – Salong Ilinium" },
      { property: "og:description", content: "Kontot saknar administratörsbehörighet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl">Ingen behörighet</h1>
      <p className="max-w-sm text-muted-foreground">
        Ditt konto har inte tillgång till adminportalen.
      </p>
      <Button asChild variant="salon" size="xl">
        <Link to="/">Till hemsidan</Link>
      </Button>
    </div>
  ),
});
