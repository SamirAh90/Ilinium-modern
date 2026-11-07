import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { PublicContent, SiteContent } from "./content";

export const getPublicContent = createServerFn({ method: "GET" }).handler(async (): Promise<PublicContent> => {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const [settings, categories, treatments, staff, gallery, hours, special] = await Promise.all([
    sb.from("site_settings").select("content").eq("id", 1).single(),
    sb.from("treatment_categories").select("id,name,sort_order").order("sort_order"),
    sb.from("treatments").select("id,category_id,name,description,price,price_from,image_url,featured,visible,sort_order").eq("visible", true).order("sort_order"),
    sb.from("staff").select("id,name,role,bio,phone,image_url,facebook_url,instagram_url,visible,sort_order").eq("visible", true).order("sort_order"),
    sb.from("gallery_images").select("id,url,alt,caption,visible,sort_order").eq("visible", true).order("sort_order"),
    sb.from("opening_hours").select("weekday,opens,closes,closed").order("weekday"),
    sb.from("special_opening_hours").select("id,date,label,opens,closes,closed").order("date"),
  ]);
  if (settings.error) throw new Error("Kunde inte läsa innehåll");

  return {
    settings: settings.data.content as unknown as SiteContent,
    categories: categories.data ?? [],
    treatments: treatments.data ?? [],
    staff: staff.data ?? [],
    gallery: gallery.data ?? [],
    hours: hours.data ?? [],
    special: special.data ?? [],
  };
});
