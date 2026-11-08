import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/site/BrandMark";
import { backend } from "@/lib/backend";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logga in – Ilinium Admin" },
      { name: "description", content: "Inloggning för Salong Iliniums administratörer." },
      { property: "og:title", content: "Logga in – Ilinium Admin" },
      { property: "og:description", content: "Inloggning för Salong Iliniums administratörer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await backend.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error("Fel e-post eller lösenord.");
      navigate({ to: "/admin" });
    } else {
      const { error } = await backend.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) return toast.error("Kunde inte skicka e-post. Försök igen.");
      toast.success("Om adressen finns har vi skickat en länk för att välja nytt lösenord.");
      setMode("login");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/60 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-soft">
        <div className="flex items-center gap-2">
          <BrandMark className="size-7" />
          <span className="font-serif text-2xl">Ilinium Admin</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Logga in för att hantera hemsidan."
            : "Ange din e-post så skickar vi en återställningslänk."}
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-11"
            />
          </div>
          {mode === "login" && (
            <div>
              <Label htmlFor="pw">Lösenord</Label>
              <Input
                id="pw"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
          )}
        </div>
        <Button type="submit" variant="salon" size="xl" className="mt-6 w-full" disabled={busy}>
          {busy ? "Vänta…" : mode === "login" ? "Logga in" : "Skicka länk"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "forgot" : "login")}
          className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "login" ? "Glömt lösenordet?" : "Tillbaka till inloggning"}
        </button>
        <Button variant="outline" size="sm" asChild className="mt-4 w-full">
          <a href="/">← Tillbaka till hemsidan</a>
        </Button>
      </form>
    </div>
  );
}
