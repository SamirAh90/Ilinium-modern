# Salong Ilinium

Independent website and CMS for Salong Ilinium. The production frontend is a static React build for STRATO Basic web hosting; content, authentication, and the database remain in Supabase.

## Local development

Requirements: Node.js 22 or newer and npm.

```sh
cp .env.example .env
npm install
npm run dev
```

The required browser-safe variables are documented in `.env.example`.

## Validation

```sh
npm test
npm run build
```

## STRATO deployment

See `STRATO-DEPLOYMENT.md`. Build the upload-ready folder with:

```sh
npm run build:strato
```

Upload the contents of `dist/` to the domain's document root. Do not upload the source repository or `.env`.

## Technology

- React, TypeScript, Vite, and TanStack Router
- Tailwind CSS
- Supabase database, authentication, and storage
- A small PHP media proxy for the private Supabase storage bucket
