import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, ImagePlus, Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { draftQuery, publishDraft, saveDraft, uploadImage, useInvalidatePublic } from "@/lib/admin";
import type { SiteContent } from "@/lib/content";

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      {title && <h2 className="mb-4 font-sans text-base font-semibold">{title}</h2>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
  hint,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
  maxLength?: number;
}) {
  const id = label.replace(/\W+/g, "-").toLowerCase() + Math.random().toString(36).slice(2, 5);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 min-h-28 text-base"
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 h-11 text-base"
        />
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ImageInput({
  label,
  value,
  onChange,
  folder,
  fallback,
}: {
  label: string;
  value: string | null;
  onChange: (url: string) => void;
  folder: string;
  fallback?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      onChange(await uploadImage(f, folder));
      toast.success("Bilden är uppladdad");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const src = value || fallback;
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-center gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
          {src && <img src={src} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => ref.current?.click()}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}{" "}
            {value ? "Byt bild" : "Ladda upp bild"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" onClick={() => onChange("")}>
              Ta bort
            </Button>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

export function MoveButtons({
  onUp,
  onDown,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7"
        onClick={onUp}
        disabled={disableUp}
        aria-label="Flytta upp"
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7"
        onClick={onDown}
        disabled={disableDown}
        aria-label="Flytta ner"
      >
        <ArrowDown />
      </Button>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

/** Edits the draft copy of site texts; publishing copies the draft to the live site. */
export function useDraftEditor() {
  const q = useQuery(draftQuery);
  const invalidate = useInvalidatePublic();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (q.data && !content) setContent(structuredClone(q.data.content));
  }, [q.data, content]);

  function update(fn: (c: SiteContent) => void) {
    setContent((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  }

  async function save() {
    if (!content) return;
    setBusy(true);
    try {
      await saveDraft(content);
      setDirty(false);
      invalidate();
      toast.success("Utkastet är sparat. Det syns inte på hemsidan förrän du publicerar.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!content) return;
    setBusy(true);
    try {
      await saveDraft(content);
      await publishDraft();
      setDirty(false);
      invalidate();
      toast.success("Publicerat! Ändringarna syns nu på hemsidan.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return { content, update, save, publish, dirty, busy, loading: q.isLoading };
}

export function DraftBar({
  editor,
  previewPath = "/",
}: {
  editor: ReturnType<typeof useDraftEditor>;
  previewPath?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border">
      <span className="mr-auto text-xs text-muted-foreground">
        {editor.dirty ? "Osparade ändringar" : "Allt sparat"}
      </span>
      <Button variant="outline" onClick={editor.save} disabled={editor.busy}>
        <Save /> Spara utkast
      </Button>
      <Button variant="outline" asChild>
        <a href={`${previewPath}?forhandsgranska=1`} target="_blank" rel="noreferrer">
          <Eye /> Förhandsgranska
        </a>
      </Button>
      <Button variant="salon" onClick={editor.publish} disabled={editor.busy}>
        <Send /> Publicera
      </Button>
    </div>
  );
}
