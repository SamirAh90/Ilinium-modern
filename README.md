# Salong Ilinium

Self-hosted website and CMS for Salong Ilinium. The complete production system runs on STRATO Basic: static React frontend, PHP 8 API, MySQL/MariaDB, administrator sessions, password reset, and local image uploads.

## Commands

```sh
npm install
npm test
npm run build:strato
```

The current salon content is stored in `public/api/seed.json` and imported by the one-time installer. See `STRATO-DEPLOYMENT.md` for the complete setup.

## Security

- Database credentials exist only in ignored `api/config.php`.
- Passwords use PHP's `password_hash` and are never stored as plaintext in MySQL.
- Admin sessions use HTTP-only, Secure, SameSite cookies.
- Database operations use prepared statements and strict table/column allowlists.
- Uploaded files are MIME-validated and script execution is blocked in `uploads/`.
