import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminPage, Loading, MoveButtons } from "@/components/admin/ui";
import { backend } from "@/lib/backend";
import { uploadImage, useInvalidatePublic } from "@/lib/admin";
import type { GalleryImage } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/galleri")({ component: Page });

function Page() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { data, error } = await backend.from("gallery_images").select("*").order("sort_order");
      if (error) throw error;
      return data as GalleryImage[];
    },
  });
  const invalidate = useInvalidatePublic();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [over, setOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  async function done(msg?: string) {
    await refetch();
    invalidate();
    if (msg) toast.success(msg);
  }

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(list.length);
    let order = (data?.reduce((m, g) => Math.max(m, g.sort_order), 0) ?? 0) + 1;
    let ok = 0;
    for (const f of list) {
      try {
        const url = await uploadImage(f, "gallery");
        const alt = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const { error } = await backend
          .from("gallery_images")
          .insert({ url, alt: `Bild från Salong Ilinium – ${alt}`, sort_order: order++ });
        if (!error) ok++;
      } catch (e) {
        toast.error((e as Error).message);
      }
      setUploading((n) => n - 1);
    }
    done(`${ok} bild${ok === 1 ? "" : "er"} uppladdade och visas i galleriet`);
  }

  async function reorder(next: GalleryImage[]) {
    await Promise.all(
      next.map((g, i) =>
        backend
          .from("gallery_images")
          .update({ sort_order: i + 1 })
          .eq("id", g.id),
      ),
    );
    done("Ordningen är sparad");
  }

  async function patch(id: string, p: Partial<GalleryImage>, msg = "Sparat") {
    const { error } = await backend.from("gallery_images").update(p).eq("id", id);
    if (error) return toast.error("Kunde inte spara.");
    done(msg);
  }

  async function replace(img: GalleryImage, f?: File) {
    if (!f) return;
    try {
      await patch(img.id, { url: await uploadImage(f, "gallery") }, "Bilden är utbytt");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (isLoading || !data) return <Loading />;

  return (
    <AdminPage
      title="Bilder och galleri"
      description="Dra bilder hit för att ladda upp. Dra i listan för att ändra ordning. Allt syns direkt."
    >
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (e.dataTransfer.files.length) {
            e.preventDefault();
            setOver(false);
            upload(e.dataTransfer.files);
          }
        }}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition ${over ? "border-taupe bg-secondary/50" : "border-border bg-card"}`}
      >
        {uploading > 0 ? (
          <Loader2 className="size-7 animate-spin" />
        ) : (
          <Upload className="size-7 text-taupe" />
        )}
        <p className="font-medium">
          {uploading > 0
            ? `Laddar upp ${uploading}…`
            : "Släpp bilder här eller klicka för att välja"}
        </p>
        <p className="text-xs text-muted-foreground">
          Flera bilder samtidigt går bra. Bilderna optimeras automatiskt.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      <ul className="space-y-3">
        {data.map((img, i) => (
          <li
            key={img.id}
            draggable
            onDragStart={() => setDragId(img.id)}
            onDragOver={(e) => {
              if (dragId) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!dragId || dragId === img.id) return;
              const next = data.filter((g) => g.id !== dragId);
              next.splice(
                next.findIndex((g) => g.id === img.id),
                0,
                data.find((g) => g.id === dragId)!,
              );
              setDragId(null);
              reorder(next);
            }}
            className={`flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-nowrap ${img.visible ? "" : "opacity-60"}`}
          >
            <GripVertical className="hidden size-4 cursor-grab text-muted-foreground sm:block" />
            <MoveButtons
              disableUp={i === 0}
              disableDown={i === data.length - 1}
              onUp={() => {
                const n = [...data];
                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                reorder(n);
              }}
              onDown={() => {
                const n = [...data];
                [n[i + 1], n[i]] = [n[i], n[i + 1]];
                reorder(n);
              }}
            />
            <label
              className="relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-muted"
              title="Byt bild"
            >
              <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => replace(img, e.target.files?.[0])}
              />
            </label>
            <div className="grid min-w-0 flex-1 gap-2">
              <Input
                defaultValue={img.caption}
                placeholder="Bildtext (valfri)"
                onBlur={(e) =>
                  e.target.value !== img.caption && patch(img.id, { caption: e.target.value })
                }
              />
              <Input
                defaultValue={img.alt}
                placeholder="Beskrivning för skärmläsare (alt-text)"
                onBlur={(e) => e.target.value !== img.alt && patch(img.id, { alt: e.target.value })}
              />
            </div>
            <Switch
              checked={img.visible}
              onCheckedChange={(v) => patch(img.id, { visible: v }, v ? "Visas" : "Dold")}
              aria-label="Synlig"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Ta bort">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ta bort bilden?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await backend.from("gallery_images").delete().eq("id", img.id);
                      done("Bilden är borttagen");
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
    </AdminPage>
  );
}
