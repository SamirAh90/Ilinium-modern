# Complete STRATO deployment

STRATO serves the complete system: frontend, PHP API, MySQL database, administrator login, and uploaded images.

## 1. Create the STRATO database

In STRATO open **Databaser och webbutrymme → Hantering av databaser → Skapa databas**. Record the database server, database name, username, and chosen password. Select the latest PHP 8 version under **Ställ in PHP-version**.

## 2. Configure

Copy `public/api/config.example.php` to `public/api/config.php` and enter the STRATO database details. Also choose:

- a random `setup_key` of at least 32 characters;
- the initial administrator email;
- a unique administrator password of at least 12 characters;
- the final HTTPS site URL and sender address.

`config.php` is ignored by Git and blocked from browser access by `.htaccess`.

## 3. Export and build

Run:

```sh
npm install
npm test
npm run build:strato
```

The output is in `dist/`. Production builds deliberately exclude `api/config.php` so credentials can never enter an archive accidentally. Upload the build, then create `api/config.php` directly on STRATO from `config.example.php`.

## 4. Upload

Upload the **contents** of `dist/` to the STRATO domain's document root using SFTP or the file manager. Include hidden files so both `.htaccess` files are transferred. Activate SSL and force HTTPS in STRATO.

Ensure PHP can write to `uploads/` (normally permissions `755`).

## 5. Install

Open `https://YOUR-DOMAIN/api/install.php`, enter the `setup_key`, and run the installer. It creates all tables, imports the current salon content, and creates the initial administrator.

Immediately after success, delete `api/install.php` from the webspace. Then log in at `/auth`.

## 6. Verify

Check `/`, `/behandlingar`, `/galleri`, `/auth`, `/admin`, an image upload, draft publishing, logout, and password reset. PHP `mail()` delivery depends on the domain's STRATO mail configuration.

## Updates

Build again and upload the changed files. Preserve `api/config.php` and `uploads/`. Do not rerun the installer for normal frontend updates.
