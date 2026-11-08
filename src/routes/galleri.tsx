import { createFileRoute } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand, GalleryGrid, PageHeader } from "@/components/site/blocks";
import { publicContentQuery, seoHead, useContent } from "@/lib/use-content";

export const Route = createFileRoute("/galleri")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicContentQuery),
  head: ({ loaderData }) =>
    seoHead(
      loaderData?.settings.seo.gallery,
      "Galleri – Salong Ilinium",
      "/galleri",
      loaderData?.settings.pages.galleryIntro,
    ),
  component: Page,
});

function Page() {
  const c = useContent();
  const s = c.settings;
  return (
    <SiteLayout>
      <PageHeader eyebrow="Inspiration" title={s.pages.galleryTitle} intro={s.pages.galleryIntro} />
      <div className="container-page py-16 md:py-24">
        <GalleryGrid images={c.gallery} />
        {s.social.instagramJasmine && (
          <div className="mt-12 text-center">
            <Button asChild variant="salon-outline" size="xl">
              <a href={s.social.instagramJasmine} target="_blank" rel="noreferrer">
                <Instagram /> Fler bilder på Instagram
              </a>
            </Button>
          </div>
        )}
      </div>
      <CtaBand title={s.cta.title} text={s.cta.text} phone={s.contact.phone} />
    </SiteLayout>
  );
}
