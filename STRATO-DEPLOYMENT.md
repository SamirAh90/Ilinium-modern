# Deploy to STRATO Basic

The app is designed for STRATO's Apache/PHP shared hosting. Node.js is needed only on the development computer to create `dist/`; it is not needed on STRATO.

## 1. Build

Copy `.env.example` to `.env` and set the publishable Supabase values and final site URL. Then run:

```sh
npm install
npm run build:strato
```

## 2. Configure private media

Copy `dist/api/config.example.php` to `dist/api/config.php` and replace both placeholders. The service-role JWT is found in Supabase project settings under API keys. It must exist only in this PHP file and must never be put in a `VITE_*` variable.

The included `.htaccess` blocks browser access to `api/config.php`.

## 3. Upload

In STRATO's file manager or with SFTP, upload the **contents** of `dist/` to the document root assigned to the domain. Ensure hidden files are included so `.htaccess` is uploaded.

Recommended STRATO settings:

- Enable the latest available PHP 8 version.
- Point the domain to the upload directory.
- Activate the included SSL certificate and force HTTPS in STRATO.
- Add both `https://ilinium.se/reset-password` and `https://www.ilinium.se/reset-password` to Supabase Authentication redirect URLs, matching the chosen canonical domain.

## 4. Verify

Check `/`, `/behandlingar`, `/galleri`, `/auth`, and `/admin`. Also open an uploaded CMS image URL beginning with `/api/public/media/` to verify PHP/cURL and the service key.

## Updating

Run `npm run build:strato` again and replace the deployed files, preserving the server-only `api/config.php` if it is not present in the new build.
