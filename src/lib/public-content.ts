import { backend } from "@/lib/backend";
import type { PublicContent, SiteContent } from "./content";

/** Reads published CMS content from the same-origin STRATO PHP API. */
export async function getPublicContent(): Promise<PublicContent> {
  const [settings, categories, treatments, staff, gallery, hours, special] = await Promise.all([
    backend.from("site_settings").select("content").eq("id", 1).single(),
    backend.from("treatment_categories").select("id,name,sort_order").order("sort_order"),
    backend
      .from("treatments")
      .select(
        "id,category_id,name,description,price,price_from,image_url,featured,visible,sort_order",
      )
      .eq("visible", true)
      .order("sort_order"),
    backend
      .from("staff")
      .select("id,name,role,bio,phone,image_url,facebook_url,instagram_url,visible,sort_order")
      .eq("visible", true)
      .order("sort_order"),
    backend
      .from("gallery_images")
      .select("id,url,alt,caption,visible,sort_order")
      .eq("visible", true)
      .order("sort_order"),
    backend.from("opening_hours").select("weekday,opens,closes,closed").order("weekday"),
    backend.from("special_opening_hours").select("id,date,label,opens,closes,closed").order("date"),
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
