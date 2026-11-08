import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { backend } from "@/lib/backend";
import type { SiteContent } from "./content";

/** Resize in the browser, then upload to STRATO's protected PHP endpoint. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Filen måste vara en bild.");
  const blob = await optimize(file);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await backend.storage
    .from("media")
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw new Error("Uppladdningen misslyckades.");
  return data?.path ?? `/uploads/${path}`;
}

async function optimize(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const max = 1800;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    return out ?? file;
  } catch {
    return file;
  }
}

export const draftQuery = queryOptions({
  queryKey: ["admin", "draft"],
  queryFn: async () => {
    const { data, error } = await backend
      .from("site_settings_draft")
      .select("content, updated_at")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return { content: data.content as unknown as SiteContent, updated_at: data.updated_at };
  },
});

export const publishedQuery = queryOptions({
  queryKey: ["admin", "published"],
  queryFn: async () => {
    const { data, error } = await backend
      .from("site_settings")
      .select("content, updated_at")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return { content: data.content as unknown as SiteContent, updated_at: data.updated_at };
  },
});

export async function saveDraft(content: SiteContent) {
  const { error } = await backend
    .from("site_settings_draft")
    .update({ content: content as never })
    .eq("id", 1);
  if (error) throw new Error("Kunde inte spara utkastet.");
}

export async function publishDraft(note?: string) {
  const { data, error } = await backend
    .from("site_settings_draft")
    .select("content")
    .eq("id", 1)
    .single();
  if (error) throw new Error("Kunde inte läsa utkastet.");
  const { data: u } = await backend.auth.getUser();
  const { data: current } = await backend
    .from("site_settings")
    .select("content")
    .eq("id", 1)
    .single();
  if (current) {
    await backend.from("content_versions").insert({
      content: current.content,
      note: note ?? "Före publicering",
      created_by: u.user?.id,
    });
  }
  const { error: e2 } = await backend
    .from("site_settings")
    .update({ content: data.content })
    .eq("id", 1);
  if (e2) throw new Error("Kunde inte publicera.");
}

export function useInvalidatePublic() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["public-content"] });
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
}
