import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import type { Staff } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/personal")({ component: Page });

type Edit = Partial<Staff> & { name: string };

function Page() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin", "staff"],
    queryFn: async () => {
      const { data, error } = await backend.from("staff").select("*").order("sort_order");
      if (error) throw error;
      return data as Staff[];
    },
  });
  const invalidate = useInvalidatePublic();
  const [edit, setEdit] = useState<Edit | null>(null);

  async function done(msg: string) {
    await refetch();
    invalidate();
    toast.success(msg);
  }

  async function save() {
    if (!edit || !edit.name.trim()) return toast.error("Ange ett namn.");
    const url = (s?: string | null) => (s && /^https?:\/\//.test(s) ? s : null);
    const row = {
      name: edit.name.trim(),
      role: edit.role ?? "",
      bio: edit.bio ?? "",
      phone: edit.phone ?? "",
      image_url: edit.image_url || null,
      facebook_url: url(edit.facebook_url),
      instagram_url: url(edit.instagram_url),
      visible: edit.visible ?? true,
    };
    const res = edit.id
      ? await backend.from("staff").update(row).eq("id", edit.id)
      : await backend.from("staff").insert({ ...row, sort_order: (data?.length ?? 0) + 1 });
    if (res.error) return toast.error("Kunde inte spara.");
    setEdit(null);
    done("Sparat");
  }

  async function move(i: number, dir: -1 | 1) {
    if (!data) return;
    const a = data[i],
      b = data[i + dir];
    await Promise.all([
      backend.from("staff").update({ sort_order: b.sort_order }).eq("id", a.id),
      backend.from("staff").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    done("Ordningen är ändrad");
  }

  if (isLoading || !data) return <Loading />;
  return (
    <AdminPage
      title="Personal"
      description="Ändringar syns direkt på hemsidan."
      actions={
        <Button variant="salon" size="xl" onClick={() => setEdit({ name: "", visible: true })}>
          <Plus /> Ny person
        </Button>
      }
    >
      <Card>
        <ul className="divide-y divide-border">
          {data.map((s, i) => (
            <li
              key={s.id}
              className={`flex items-center gap-3 py-3 ${s.visible ? "" : "opacity-50"}`}
            >
              <MoveButtons
                disableUp={i === 0}
                disableDown={i === data.length - 1}
                onUp={() => move(i, -1)}
                onDown={() => move(i, 1)}
              />
              <div className="size-12 overflow-hidden rounded-full bg-muted">
                {s.image_url && (
                  <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <button className="min-w-0 flex-1 text-left" onClick={() => setEdit(s)}>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.role} · {s.phone}
                </p>
              </button>
              <Switch
                checked={s.visible}
                onCheckedChange={async (v) => {
                  await backend.from("staff").update({ visible: v }).eq("id", s.id);
                  done(v ? "Visas på hemsidan" : "Dold");
                }}
                aria-label="Synlig"
              />
              <Button variant="ghost" size="icon" onClick={() => setEdit(s)} aria-label="Redigera">
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
                    <AlertDialogTitle>Ta bort {s.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Profilen försvinner från hemsidan. Vill du bara dölja den, använd reglaget
                      istället.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await backend.from("staff").delete().eq("id", s.id);
                        done("Borttagen");
                      }}
                    >
                      Ta bort
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      </Card>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{edit?.id ? "Redigera" : "Ny person"}</DialogTitle>
          </DialogHeader>
          {edit && (
            <div className="space-y-4">
              <Field
                label="Namn"
                value={edit.name}
                maxLength={60}
                onChange={(v) => setEdit({ ...edit, name: v })}
              />
              <Field
                label="Roll"
                value={edit.role ?? ""}
                maxLength={60}
                onChange={(v) => setEdit({ ...edit, role: v })}
              />
              <Field
                label="Telefon"
                type="tel"
                value={edit.phone ?? ""}
                maxLength={20}
                onChange={(v) => setEdit({ ...edit, phone: v })}
              />
              <Field
                label="Kort presentation"
                multiline
                value={edit.bio ?? ""}
                maxLength={400}
                onChange={(v) => setEdit({ ...edit, bio: v })}
              />
              <Field
                label="Facebook-länk"
                value={edit.facebook_url ?? ""}
                onChange={(v) => setEdit({ ...edit, facebook_url: v })}
                hint="Börjar med https://"
              />
              <Field
                label="Instagram-länk"
                value={edit.instagram_url ?? ""}
                onChange={(v) => setEdit({ ...edit, instagram_url: v })}
              />
              <ImageInput
                label="Profilbild"
                folder="staff"
                value={edit.image_url ?? ""}
                onChange={(v) => setEdit({ ...edit, image_url: v })}
              />
              <Button variant="salon" size="xl" className="w-full" onClick={save}>
                Spara
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
