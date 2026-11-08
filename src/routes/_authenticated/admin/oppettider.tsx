import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminPage, Card, Loading } from "@/components/admin/ui";
import { backend } from "@/lib/backend";
import { useInvalidatePublic } from "@/lib/admin";
import { WEEKDAYS, formatHourRow, type OpeningHour, type SpecialHour } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/oppettider")({ component: Page });

const t5 = (t: string | null) => (t ? t.slice(0, 5) : "");

function Page() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin", "hours"],
    queryFn: async () => {
      const [h, s] = await Promise.all([
        backend.from("opening_hours").select("*").order("weekday"),
        backend.from("special_opening_hours").select("*").order("date"),
      ]);
      if (h.error || s.error) throw new Error("Kunde inte läsa öppettider");
      return { hours: h.data as OpeningHour[], special: s.data as SpecialHour[] };
    },
  });
  const invalidate = useInvalidatePublic();
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [busy, setBusy] = useState(false);
  const [ns, setNs] = useState({
    date: "",
    label: "",
    opens: "10:00",
    closes: "15:00",
    closed: true,
  });

  useEffect(() => {
    if (data) setHours(data.hours.map((h) => ({ ...h, opens: t5(h.opens), closes: t5(h.closes) })));
  }, [data]);

  async function saveWeek() {
    for (const h of hours) {
      if (!h.closed && (!h.opens || !h.closes || h.opens >= h.closes))
        return toast.error(`Kontrollera tiderna för ${WEEKDAYS[h.weekday - 1]}.`);
    }
    setBusy(true);
    const { error } = await backend.from("opening_hours").upsert(
      hours.map((h) => ({
        weekday: h.weekday,
        closed: h.closed,
        opens: h.closed ? null : h.opens,
        closes: h.closed ? null : h.closes,
      })),
    );
    setBusy(false);
    if (error) return toast.error("Kunde inte spara.");
    await refetch();
    invalidate();
    toast.success("Öppettiderna är uppdaterade på hemsidan.");
  }

  async function addSpecial() {
    if (!ns.date) return toast.error("Välj ett datum.");
    if (!ns.closed && ns.opens >= ns.closes) return toast.error("Kontrollera tiderna.");
    const { error } = await backend.from("special_opening_hours").insert({
      date: ns.date,
      label: ns.label,
      closed: ns.closed,
      opens: ns.closed ? null : ns.opens,
      closes: ns.closed ? null : ns.closes,
    });
    if (error) return toast.error("Kunde inte spara.");
    setNs({ ...ns, date: "", label: "" });
    await refetch();
    invalidate();
    toast.success("Avvikande öppettid tillagd.");
  }

  if (isLoading || !data) return <Loading />;
  return (
    <AdminPage
      title="Öppettider"
      description="Öppettiderna kommer från en extern katalog (jan 2024) – kontrollera att de stämmer."
    >
      <Card title="Ordinarie vecka">
        <ul className="divide-y divide-border">
          {hours.map((h, i) => (
            <li key={h.weekday} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-24 font-medium">{WEEKDAYS[h.weekday - 1]}</span>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={!h.closed}
                  onCheckedChange={(v) =>
                    setHours(
                      hours.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              closed: !v,
                              opens: x.opens || "10:00",
                              closes: x.closes || "19:00",
                            }
                          : x,
                      ),
                    )
                  }
                />
                {h.closed ? "Stängt" : "Öppet"}
              </label>
              {!h.closed && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={h.opens ?? ""}
                    onChange={(e) =>
                      setHours(hours.map((x, j) => (j === i ? { ...x, opens: e.target.value } : x)))
                    }
                    className="h-11 w-28"
                    aria-label="Öppnar"
                  />
                  <span>–</span>
                  <Input
                    type="time"
                    value={h.closes ?? ""}
                    onChange={(e) =>
                      setHours(
                        hours.map((x, j) => (j === i ? { ...x, closes: e.target.value } : x)),
                      )
                    }
                    className="h-11 w-28"
                    aria-label="Stänger"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        <Button variant="salon" size="xl" onClick={saveWeek} disabled={busy}>
          <Save /> Spara öppettider
        </Button>
      </Card>

      <Card title="Helgdagar och tillfälliga stängningar">
        <ul className="divide-y divide-border">
          {data.special.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-28 font-medium">{s.date}</span>
              <span className="flex-1">{s.label}</span>
              <span>{formatHourRow(s)}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Ta bort"
                onClick={async () => {
                  await backend.from("special_opening_hours").delete().eq("id", s.id);
                  await refetch();
                  invalidate();
                  toast.success("Borttagen");
                }}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
          {data.special.length === 0 && (
            <li className="py-2 text-sm text-muted-foreground">Inga avvikande dagar.</li>
          )}
        </ul>
        <div className="grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
          <Input
            type="date"
            value={ns.date}
            onChange={(e) => setNs({ ...ns, date: e.target.value })}
            className="h-11"
            aria-label="Datum"
          />
          <Input
            placeholder="T.ex. Julafton"
            value={ns.label}
            maxLength={60}
            onChange={(e) => setNs({ ...ns, label: e.target.value })}
            className="h-11"
          />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={!ns.closed} onCheckedChange={(v) => setNs({ ...ns, closed: !v })} />
            {ns.closed ? "Stängt hela dagen" : "Öppet med ändrade tider"}
          </label>
          {!ns.closed && (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={ns.opens}
                onChange={(e) => setNs({ ...ns, opens: e.target.value })}
                className="h-11"
              />
              –
              <Input
                type="time"
                value={ns.closes}
                onChange={(e) => setNs({ ...ns, closes: e.target.value })}
                className="h-11"
              />
            </div>
          )}
          <Button variant="outline" onClick={addSpecial} className="sm:col-span-2">
            <Plus /> Lägg till
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Ett längre stängningsmeddelande kan du visa via "Tillfälligt meddelande" på startsidan.
        </p>
      </Card>
    </AdminPage>
  );
}
