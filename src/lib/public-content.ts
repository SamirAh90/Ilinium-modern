import { supabase } from "@/integrations/supabase/client";
import type { PublicContent, SiteContent } from "./content";

/** Reads the published CMS content through Supabase's public RLS policies. */
export async function getPublicContent(): Promise<PublicContent> {
  const [settings, categories, treatments, staff, gallery, hours, special] = await Promise.all([
    supabase.from("site_settings").select("content").eq("id", 1).single(),
    supabase.from("treatment_categories").select("id,name,sort_order").order("sort_order"),
    supabase.from("treatments").select("id,category_id,name,description,price,price_from,image_url,featured,visible,sort_order").eq("visible", true).order("sort_order"),
    supabase.from("staff").select("id,name,role,bio,phone,image_url,facebook_url,instagram_url,visible,sort_order").eq("visible", true).order("sort_order"),
    supabase.from("gallery_images").select("id,url,alt,caption,visible,sort_order").eq("visible", true).order("sort_order"),
    supabase.from("opening_hours").select("weekday,opens,closes,closed").order("weekday"),
    supabase.from("special_opening_hours").select("id,date,label,opens,closes,closed").order("date"),
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
}
