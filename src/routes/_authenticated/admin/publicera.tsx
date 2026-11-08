import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPage, Card, Loading } from "@/components/admin/ui";
import { backend } from "@/lib/backend";
import {
  draftQuery,
  publishDraft,
  publishedQuery,
  saveDraft,
  useInvalidatePublic,
} from "@/lib/admin";
import type { SiteContent } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/publicera")({ component: Page });

function Page() {
  const draft = useQuery(draftQuery);
  const pub = useQuery(publishedQuery);
  const versions = useQuery({
    queryKey: ["admin", "versions"],
    queryFn: async () => {
      const { data, error } = await backend
        .from("content_versions")
        .select("id, created_at, note, content")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
  const invalidate = useInvalidatePublic();
  const [busy, setBusy] = useState(false);

  if (!draft.data || !pub.data) return <Loading />;
  const pending = JSON.stringify(draft.data.content) !== JSON.stringify(pub.data.content);

  async function publish() {
    setBusy(true);
    try {
      await publishDraft();
      invalidate();
      await versions.refetch();
      toast.success("Publicerat! Ändringarna syns nu på hemsidan.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function restore(content: unknown) {
    setBusy(true);
    try {
      await saveDraft(content as SiteContent);
      invalidate();
      toast.success(
        "Versionen är återställd som utkast. Förhandsgranska och publicera för att visa den.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPage title="Publicera ändringar">
      <Card>
        <p className={pending ? "font-medium" : "text-muted-foreground"}>
          {pending
            ? "Det finns sparade textändringar som ännu inte visas på hemsidan."
            : "Hemsidan visar redan senaste versionen av texterna."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="/?forhandsgranska=1" target="_blank" rel="noreferrer">
              <Eye /> Förhandsgranska
            </a>
          </Button>
          <Button variant="salon" onClick={publish} disabled={!pending || busy}>
            <Send /> Publicera nu
          </Button>
        </div>
      </Card>
      <Card title="Tidigare versioner">
        {versions.isLoading ? (
          <Loading />
        ) : (
          <ul className="divide-y divide-border">
            {(versions.data ?? []).map(
              (v: { id: string; created_at: string; note: string; content: unknown }) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    {new Date(v.created_at).toLocaleString("sv-SE")}{" "}
                    <span className="text-muted-foreground">· {v.note}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => restore(v.content)}
                    disabled={busy}
                  >
                    <RotateCcw /> Återställ
                  </Button>
                </li>
              ),
            )}
            {versions.data?.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">
                Inga tidigare versioner än. En sparas varje gång du publicerar.
              </li>
            )}
          </ul>
        )}
      </Card>
    </AdminPage>
  );
}
