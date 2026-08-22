# Dress Catalog Next.js Redesigned

Production-ready starter using Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, Neon/PostgreSQL, Cloudinary and Vercel.

## New design changes

- Tile-based landing page
- Shop name and logo in header
- Three-dot menu hides Admin Login
- Admin form moved to `/admin`
- Size selection uses instant buttons, no Done button required
- Category filter uses chips instead of dropdown
- Database errors are caught so the home page does not crash

## Run locally

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Deploy to Vercel

Add these environment variables in Vercel:

```text
DATABASE_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
ADMIN_PASSWORD
NEXT_PUBLIC_SELLER_PHONE
NEXT_PUBLIC_SELLER_EMAIL
NEXT_PUBLIC_SHOP_NAME
NEXT_PUBLIC_SHOP_TAGLINE
```

Then push to GitHub and redeploy from Vercel.

## Backup / Local Edit / Sync

The project includes safe local backup and synchronization scripts for Neon/PostgreSQL and Cloudinary.

Install dependencies with `npm install`. For the full database dump/restore commands, install PostgreSQL client tools so `pg_dump` and `pg_restore` are available on PATH.

### Full backup

```bash
npm run backup
```

Creates a timestamped folder under `backup/` containing PostgreSQL JSON exports, a custom PostgreSQL dump when `pg_dump` is available, a Cloudinary image manifest, and downloaded Cloudinary images. The same Cloudinary image library is also refreshed under `local-data/images/`.

### Export editable data

```bash
npm run export:data
```

Creates `local-data/dresses.json`. Image entries include `url`, `localFile`, and `cloudinaryPublicId` when the relationship is known.

### Validate local changes

```bash
npm run validate:changes
```

Checks required dress fields, sizes/prices, image existence, exactly one main image, and unique image ordering.

### Sync local changes

```bash
npm run sync
```

Updates existing dresses by ID, creates dresses without an ID, replaces sizes, creates/updates image rows, and uploads local images to Cloudinary. Existing Cloudinary assets are never automatically deleted.

### Image inventory

```bash
npm run images:inventory
```

Refreshes `local-data/images-manifest.json` with Cloudinary public IDs, URLs, dimensions, file sizes, and whether each asset is referenced by a `DressImage` row.

### Restore database

```powershell
$env:CONFIRM_RESTORE="YES"; npm run restore
```

In Command Prompt use:

```cmd
set CONFIRM_RESTORE=YES && npm run restore
```

This is destructive and restores the newest `backup/*/database/neon.dump` into `DATABASE_URL`. Use only when you intentionally want to replace the target database.

## Backup and restore

- `npm run backup` backs up PostgreSQL/Neon JSON data and dump (when `pg_dump` is available), and downloads Cloudinary image assets plus metadata.
- `npm run restore` restores only PostgreSQL/Neon from the latest `neon.dump`. It requires `CONFIRM_RESTORE=YES`.
- `npm run restore:cloudinary` restores Cloudinary images from the latest local backup and updates matching `DressImage.url` values. It requires `CONFIRM_CLOUDINARY_RESTORE=YES`.
- `npm run restore:all` restores both Cloudinary and PostgreSQL from the latest backup, then reconciles `DressImage.url` values to the restored Cloudinary URLs. It requires `CONFIRM_RESTORE_ALL=YES`.

Examples on Windows PowerShell:

```powershell
$env:CONFIRM_RESTORE="YES"; npm run restore
$env:CONFIRM_CLOUDINARY_RESTORE="YES"; npm run restore:cloudinary
$env:CONFIRM_RESTORE_ALL="YES"; npm run restore:all
```

`restore:cloudinary` re-uploads the image files saved in `backup/<timestamp>/cloudinary/images` using their backed-up Cloudinary public IDs. Cloudinary supports restoring backed-up assets through its Admin API as well; this project keeps its own downloaded backup so recovery does not depend solely on Cloudinary's account-level backup retention. Cloudinary's APIs support restoring backed-up resources and version history. 
