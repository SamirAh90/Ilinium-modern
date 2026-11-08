import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getPublicContent } from "./public-content";
import type { PublicContent, SiteContent } from "./content";
import { backend } from "@/lib/backend";
export { seoHead } from "./seo";

export const publicContentQuery = queryOptions({
  queryKey: ["public-content"],
  queryFn: () => getPublicContent(),
  staleTime: 30_000,
});

/** Published content; admins can append ?forhandsgranska=1 to see the unpublished draft texts. */
export function useContent(): PublicContent & { preview: boolean } {
  const { data } = useSuspenseQuery(publicContentQuery);
  const [draft, setDraft] = useState<SiteContent | null>(null);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("forhandsgranska")) return;
    backend
      .from("site_settings_draft")
      .select("content")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data: row }) => {
        if (row?.content) setDraft(row.content as unknown as SiteContent);
      });
  }, []);

  return { ...data, settings: draft ?? data.settings, preview: !!draft };
}
