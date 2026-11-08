import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPage, Card, Field, ImageInput, Loading, MoveButtons } from "@/components/admin/ui";
import { backend } from "@/lib/backend";
import { useInvalidatePublic } from "@/lib/admin";
import { formatPrice, type Category, type Treatment } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/behandlingar")({ component: Page });

const q = {
  queryKey: ["admin", "treatments"],
  queryFn: async () => {
    const [c, t] = await Promise.all([
      backend.from("treatment_categories").select("*").order("sort_order"),
      backend.from("treatments").select("*").order("sort_order"),
    ]);
    if (c.error || t.error) throw new Error("Kunde inte läsa behandlingar");
    return { categories: c.data as Category[], treatments: t.data as Treatment[] };
  },
};

type Edit = Partial<Treatment> & { name: string; price: number };

function Page() {
  const { data, refetch, isLoading } = useQuery(q);
  const invalidate = useInvalidatePublic();
  const [edit, setEdit] = useState<Edit | null>(null);
  const [newCat, setNewCat] = useState("");

  async function done(msg: string) {
    await refetch();
    invalidate();
    toast.success(msg);
  }

  async function saveTreatment() {
    if (!edit) return;
    if (!edit.name.trim()) return toast.error("Ange ett namn.");
    if (!Number.isFinite(edit.price) || edit.price < 0)
      return toast.error("Ange ett giltigt pris.");
    const row = {
      name: edit.name.trim(),
      description: edit.description ?? "",
      price: Math.round(edit.price),
      price_from: !!edit.price_from,
      category_id: edit.category_id ?? null,
      image_url: edit.image_url || null,
      featured: !!edit.featured,
      visible: edit.visible ?? true,
    };
    const res = edit.id
      ? await backend.from("treatments").update(row).eq("id", edit.id)
      : await backend
          .from("treatments")
          .insert({ ...row, sort_order: (data?.treatments.length ?? 0) + 1 });
    if (res.error) return toast.error("Kunde inte spara.");
    setEdit(null);
    done("Sparat – priset är uppdaterat på hemsidan.");
  }

  async function quick(id: string, patch: Partial<Treatment>) {
    const { error } = await backend.from("treatments").update(patch).eq("id", id);
    if (error) return toast.error("Kunde inte spara.");
    done("Sparat");
  }

  async function move(list: Treatment[], i: number, dir: -1 | 1) {
    const a = list[i],
      b = list[i + dir];
    await Promise.all([
      backend.from("treatments").update({ sort_order: b.sort_order }).eq("id", a.id),
      backend.from("treatments").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    done("Ordningen är ändrad");
  }

  async function remove(id: string) {
    const { error } = await backend.from("treatments").delete().eq("id", id);
    if (error) return toast.error("Kunde inte ta bort.");
    done("Behandlingen är borttagen");
  }

  async function addCategory() {
    if (!newCat.trim()) return;
    const { error } = await backend
      .from("treatment_categories")
      .insert({ name: newCat.trim(), sort_order: (data?.categories.length ?? 0) + 1 });
    if (error) return toast.error("Kunde inte lägga till.");
    setNewCat("");
    done("Kategori tillagd");
  }

  async function renameCategory(id: string, name: string) {
    if (!name.trim()) return;
    await backend.from("treatment_categories").update({ name: name.trim() }).eq("id", id);
    done("Kategori sparad");
  }

  async function removeCategory(id: string) {
    await backend.from("treatment_categories").delete().eq("id", id);
    done("Kategori borttagen");
  }

  if (isLoading || !data) return <Loading />;

  const groups = [
    ...data.categories.map((c) => ({
      cat: c as Category | null,
      items: data.treatments.filter((t) => t.category_id === c.id),
    })),
    { cat: null, items: data.treatments.filter((t) => !t.category_id) },
  ].filter((g) => g.cat || g.items.length);

  return (
    <AdminPage
      title="Behandlingar och priser"
      description="Ändringar sparas och syns direkt överallt där priset visas. Stjärna = visas på startsidan."
      actions={
        <Button
          variant="salon"
          size="xl"
          onClick={() =>
            setEdit({ name: "", price: 0, visible: true, category_id: data.categories[0]?.id })
          }
        >
          <Plus /> Ny behandling
        </Button>
      }
    >
      {groups.map((g) => (
        <Card key={g.cat?.id ?? "none"} title={g.cat?.name ?? "Utan kategori"}>
          <ul className="divide-y divide-border">
            {g.items.map((t, i) => (
              <li
                key={t.id}
                className={`flex items-center gap-2 py-3 ${t.visible ? "" : "opacity-50"}`}
              >
                <MoveButtons
                  disableUp={i === 0}
                  disableDown={i === g.items.length - 1}
                  onUp={() => move(g.items, i, -1)}
                  onDown={() => move(g.items, i, 1)}
                />
                <button className="min-w-0 flex-1 text-left" onClick={() => setEdit(t)}>
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(t.price, t.price_from)}
                    {!t.visible && " · Dold"}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => quick(t.id, { featured: !t.featured })}
                  aria-label="Visa på startsidan"
                >
                  <Star className={t.featured ? "fill-taupe text-taupe" : ""} />
                </Button>
                <Switch
                  checked={t.visible}
                  onCheckedChange={(v) => quick(t.id, { visible: v })}
                  aria-label="Synlig"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEdit(t)}
                  aria-label="Redigera"
                >
                  <Pencil />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Ta bort">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ta bort "{t.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Behandlingen försvinner från hemsidan. Det går inte att ångra.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(t.id)}>Ta bort</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
            {g.items.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">Inga behandlingar i kategorin.</li>
            )}
          </ul>
        </Card>
      ))}

      <Card title="Kategorier">
        {data.categories.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <Input
              defaultValue={c.name}
              onBlur={(e) => e.target.value !== c.name && renameCategory(c.id, e.target.value)}
              className="h-10"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCategory(c.id)}
              aria-label="Ta bort kategori"
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Ny kategori"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="h-10"
          />
          <Button variant="outline" onClick={addCategory}>
            <Plus /> Lägg till
          </Button>
        </div>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Redigera behandling" : "Ny behandling"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              <Field
                label="Namn"
                value={edit.name}
                maxLength={80}
                onChange={(v) => setEdit({ ...edit, name: v })}
              />
              <Field
                label="Beskrivning"
                multiline
                value={edit.description ?? ""}
                maxLength={300}
                onChange={(v) => setEdit({ ...edit, description: v })}
              />
              <div>
                <Label htmlFor="price">Pris (kr)</Label>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={edit.price}
                  onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })}
                  className="mt-1.5 h-12 text-lg"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={!!edit.price_from}
                  onCheckedChange={(v) => setEdit({ ...edit, price_from: v })}
                />
                <span className="text-sm">Visa som "Från"-pris</span>
              </div>
              <div>
                <Label htmlFor="cat">Kategori</Label>
                <select
                  id="cat"
                  value={edit.category_id ?? ""}
                  onChange={(e) => setEdit({ ...edit, category_id: e.target.value || null })}
                  className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3"
                >
                  <option value="">Ingen</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={!!edit.featured}
                  onCheckedChange={(v) => setEdit({ ...edit, featured: v })}
                />
                <span className="text-sm">Visa på startsidan</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={edit.visible ?? true}
                  onCheckedChange={(v) => setEdit({ ...edit, visible: v })}
                />
                <span className="text-sm">Synlig på hemsidan</span>
              </div>
              <ImageInput
                label="Bild"
                folder="treatments"
                value={edit.image_url ?? ""}
                onChange={(v) => setEdit({ ...edit, image_url: v })}
              />
              <Button variant="salon" size="xl" className="w-full" onClick={saveTreatment}>
                Spara ändring
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
