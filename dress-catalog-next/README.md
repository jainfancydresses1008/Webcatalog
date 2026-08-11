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
