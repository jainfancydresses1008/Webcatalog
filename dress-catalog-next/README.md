# Dress Catalog Next.js Project

A production-ready starter for a dress catalog website using:

- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Cloudinary image upload
- Vercel deployment

## Features

- Home page catalog tiles
- Dress images with gallery
- Category filter
- Search by category, character name and description
- Multiple sizes per dress
- Price changes based on selected size
- Dress details modal
- WhatsApp, Email and SMS inquiry links
- Admin Add Dress form
- Cloudinary upload support
- PostgreSQL persistence through Prisma

## 1. Install

```bash
npm install
```

## 2. Configure environment

Copy the example file:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
ADMIN_PASSWORD="change-this-admin-password"
NEXT_PUBLIC_SELLER_PHONE="919999999999"
NEXT_PUBLIC_SELLER_EMAIL="seller@example.com"
```

## 3. Create database tables

```bash
npx prisma migrate dev --name init
```

## 4. Seed sample dresses

```bash
npm run prisma:seed
```

## 5. Run locally

```bash
npm run dev
```

Open the local site shown in your terminal.

## 6. Build

```bash
npm run build
npm run start
```

## 7. Deploy to Vercel

1. Push this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add all environment variables from `.env.example` in Vercel Project Settings.
4. Deploy.

Vercel will generate a free URL like `your-project-name.vercel.app`. You can add a custom domain later.

## Admin usage

Click `Admin: Add Dress`, enter the admin password, and add:

- Category
- Character name
- Description
- Image URL or image file upload
- Sizes, for example `S, M, L, XL`
- Prices, for example `1000, 1200, 1400, 1600`
- Optional gallery image URLs, one per line

## Notes for production hardening

This starter uses a simple admin password to keep the first version easy. For a real production admin dashboard, add proper authentication such as Auth.js, Clerk, Microsoft Entra ID, or another identity provider.

For heavy image usage, use Cloudinary upload in the admin form instead of manually pasting image URLs.
