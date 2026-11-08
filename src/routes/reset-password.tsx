import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backend } from "@/lib/backend";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nytt lösenord – Ilinium Admin" },
      { name: "description", content: "Välj ett nytt lösenord för adminportalen." },
      { property: "og:title", content: "Nytt lösenord – Ilinium Admin" },
      { property: "og:description", content: "Välj ett nytt lösenord för adminportalen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 12) return toast.error("Lösenordet måste ha minst 12 tecken.");
    setBusy(true);
    const { error } = await backend.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error("Kunde inte spara lösenordet. Länken kan ha gått ut.");
    toast.success("Lösenordet är ändrat.");
    navigate({ to: "/auth" });
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/60 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-soft">
        <h1 className="text-3xl">Välj nytt lösenord</h1>
        <Label htmlFor="pw" className="mt-6 block">
          Nytt lösenord
        </Label>
        <Input
          id="pw"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="mt-1.5 h-11"
        />
        <Button type="submit" variant="salon" size="xl" className="mt-6 w-full" disabled={busy}>
          Spara lösenord
        </Button>
      </form>
    </div>
  );
}
