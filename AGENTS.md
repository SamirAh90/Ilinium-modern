<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Public SEO uses the shared browser-safe SEO helper with leaf-only self-referencing URLs; the static sitemap lists only public content routes. This avoids duplicate canonicals and indexing admin pages.
- HairSalon structured data derives contact and profile links from published CMS content; omit unverified hours and ratings to avoid asserting unsupported business facts.
- Legal page content uses the existing published/draft settings workflow and is edited under admin page texts, keeping legal copy owner-controlled.
- Public pages read all content via `getPublicContent` server fn (publishable key) — no hardcoded prices/texts/hours in components.
- The About page's primary image comes from `settings.pages.aboutImage`; it is independent of gallery ordering so gallery changes cannot replace it.
- Site texts live in `site_settings` (published) and `site_settings_draft`; admin edits the draft, publishing copies it and snapshots the previous version into `content_versions`.
- Treatments, staff, gallery and opening hours save live (no draft) — simpler for owners.
- Uploaded images go to the private `media` bucket and are served through `/api/public/media/*` because the workspace blocks public buckets.
- Public signup is disabled; every auth user gets the admin role via trigger, so admins are added only from the backend user list.
- A remix copies the role-granting function but drops the `auth.users` INSERT trigger, so new auth users get no role until the trigger is recreated — check the trigger before assuming the grant function works.
