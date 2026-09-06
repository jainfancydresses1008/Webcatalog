import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categorySlug } from "@/lib/category-slug";
import { dressSlug } from "@/lib/dress-slug";
import DressDetailsPageClient from "@/components/DressDetailsPageClient";

const SITE_URL = "https://jainfancydresses.in";

function parseDressId(slug: string) {
  const match = slug.match(/-(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

async function getDress(slug: string) {
  const id = parseDressId(slug);
  if (!id) return null;

  const dress = await prisma.dress.findFirst({
    where: { id, isActive: true },
    include: {
      categoryRef: true,
      sizes: { orderBy: { id: "asc" } },
      images: {
        orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!dress || dressSlug(dress.characterName, dress.id) !== slug) {
    return null;
  }

  return dress;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dress = await getDress(slug);

  if (!dress) {
    return {
      title: "Dress Not Found",
      robots: { index: false, follow: true },
    };
  }

  const title = `${dress.characterName} Fancy Dress Costume for Kids`;
  const context = [dress.categoryRef.name, dress.subcategory]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" | ");
  const description = dress.description?.trim()
    ? `${dress.description.trim()}${context ? ` Browse this ${context.toLowerCase()} fancy dress costume for kids from Jain Fancy Dresses.` : " Browse this fancy dress costume for kids from Jain Fancy Dresses."}`
    : `${dress.characterName} fancy dress costume for kids${context ? ` in ${context.toLowerCase()}` : ""} from Jain Fancy Dresses. Suitable for school events, fancy dress competitions, cultural programs, dance performances and special occasions.`;
  const canonical = `${SITE_URL}/dresses/${slug}`;
  const mainImage = dress.images.find((image) => image.isMain) ?? dress.images[0];

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Jain Fancy Dresses",
      type: "website",
      locale: "en_IN",
      ...(mainImage ? {
        images: [{
          url: mainImage.url,
          alt: mainImage.altText ?? dress.characterName,
        }],
      } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(mainImage ? { images: [mainImage.url] } : {}),
    },
  };
}

export default async function DressPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dress = await getDress(slug);

  if (!dress) notFound();

  const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE ?? "919999999999";
  const sellerEmail = process.env.NEXT_PUBLIC_SELLER_EMAIL ?? "seller@example.com";
  const canonical = `${SITE_URL}/dresses/${slug}`;
  const mainImage = dress.images.find((image) => image.isMain) ?? dress.images[0];

  const categoryCanonical = `${SITE_URL}/fancy-dresses/${categorySlug(dress.categoryRef.name)}`;

  // The dress page visibly shows a price for each available size.
  // Use an AggregateOffer so the Product structured data reflects the
  // actual range of prices shown on the page.
  const prices = dress.sizes
    .map((size) => size.price)
    .filter((price): price is number => Number.isFinite(price) && price >= 0);

  const productOffers =
    prices.length > 0
      ? {
          "@type": "AggregateOffer",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          priceCurrency: "INR",
          offerCount: prices.length,
          availability: "https://schema.org/InStock",
        }
      : null;

  const dressJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonical}#product`,
    name: dress.characterName,
    description: dress.description,
    url: canonical,
    mainEntityOfPage: canonical,
    sku: String(dress.id),
    image: dress.images.map((image) => image.url),
    category: `${dress.categoryRef.name}${dress.subcategory ? ` > ${dress.subcategory}` : ""}`,
    brand: {
      "@type": "Brand",
      name: "Jain Fancy Dresses",
    },
    ...(productOffers ? { offers: productOffers } : {}),
    ...(mainImage ? {
      subjectOf: {
        "@type": "ImageObject",
        contentUrl: mainImage.url,
        caption: mainImage.altText ?? dress.characterName,
      },
    } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dress.categoryRef.name,
        item: categoryCanonical,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dress.characterName,
        item: canonical,
      },
    ],
  };

  return (
    <>
      {productOffers && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dressJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DressDetailsPageClient
        dress={dress}
        sellerPhone={sellerPhone}
        sellerEmail={sellerEmail}
      />
    </>
  );
}
