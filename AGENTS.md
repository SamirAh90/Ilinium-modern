## Architecture rules

- The production build is a static Vite/React application for Apache hosting on STRATO Basic; no Node.js runtime is required.
- Public SEO uses the shared browser-safe SEO helper with leaf-only self-referencing URLs; the static sitemap lists only public content routes.
- HairSalon structured data derives contact and profile links from published CMS content; omit unverified hours and ratings.
- Legal page content uses the existing published/draft settings workflow and is edited under admin page texts.
- Public pages read all content via `getPublicContent` and the same-origin STRATO PHP API; do not hardcode prices, texts, or hours in components.
- The About page's primary image comes from `settings.pages.aboutImage`; it is independent of gallery ordering.
- Site texts live in `site_settings` (published) and `site_settings_draft`; publishing snapshots the previous version into `content_versions`.
- Treatments, staff, gallery, and opening hours save live.
- Uploaded images are MIME-validated by PHP and stored beneath `/uploads/`; script execution is blocked there.
- Public signup is disabled; the initial administrator is created only by the protected one-time installer.
