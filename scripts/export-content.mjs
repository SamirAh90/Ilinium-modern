import { readFile, writeFile } from "node:fs/promises";

const env = Object.fromEntries((await readFile(".env", "utf8")).split(/\r?\n/).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
  const at = line.indexOf("=");
  return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, "")];
}));
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
const tables = {
  site_settings: ["id", "content", "updated_at"],
  treatment_categories: ["id", "name", "sort_order"],
  treatments: ["id", "category_id", "name", "description", "price", "price_from", "image_url", "featured", "visible", "sort_order"],
  staff: ["id", "name", "role", "bio", "phone", "image_url", "facebook_url", "instagram_url", "visible", "sort_order"],
  gallery_images: ["id", "url", "alt", "caption", "visible", "sort_order"],
  opening_hours: ["weekday", "opens", "closes", "closed"],
  special_opening_hours: ["id", "date", "label", "opens", "closes", "closed"],
};
const seed = {};
for (const [table, fields] of Object.entries(tables)) {
  const headers = { apikey: key };
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  const response = await fetch(`${url}/rest/v1/${table}?select=*`, { headers });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  seed[table] = (await response.json()).map((row) => Object.fromEntries(fields.filter((field) => field in row).map((field) => [field, row[field]])));
}
seed.site_settings_draft = seed.site_settings.map((row) => ({ ...row }));
await writeFile("public/api/seed.json", `${JSON.stringify(seed, null, 2)}\n`);
console.log(`Exported ${Object.values(seed).reduce((sum, rows) => sum + rows.length, 0)} rows to public/api/seed.json`);
