import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dressSlug } from "@/lib/dress-slug";
import DressDetailsModal from "@/components/DressDetailsModal";

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
  const description = dress.description?.trim()
    ? `${dress.description.trim()} Browse this ${dress.categoryRef.name.toLowerCase()} fancy dress costume from Jain Fancy Dresses.`
    : `${dress.characterName} fancy dress costume for kids from Jain Fancy Dresses. Suitable for school events, fancy dress competitions, cultural programs and special occasions.`;
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

  const selectedSize = dress.sizes[0];
  const message = `Hello, I am interested in this dress.\nCategory: ${dress.categoryRef.name}\nSubcategory: ${dress.subcategory ?? ""}\nCharacter Name: ${dress.characterName}\nSelected Size: ${selectedSize?.size ?? ""}\nPrice: ₹${selectedSize?.price ?? ""}`;
  const encodedMessage = encodeURIComponent(message);
  const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE ?? "919999999999";
  const sellerEmail = process.env.NEXT_PUBLIC_SELLER_EMAIL ?? "seller@example.com";
  const canonical = `${SITE_URL}/dresses/${slug}`;
  const mainImage = dress.images.find((image) => image.isMain) ?? dress.images[0];

  const dressJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: dress.characterName,
    description: dress.description,
    url: canonical,
    image: dress.images.map((image) => image.url),
    category: `${dress.categoryRef.name}${dress.subcategory ? ` > ${dress.subcategory}` : ""}`,
    brand: {
      "@type": "Brand",
      name: "Jain Fancy Dresses",
    },
    ...(mainImage ? {
      subjectOf: {
        "@type": "ImageObject",
        contentUrl: mainImage.url,
        caption: mainImage.altText ?? dress.characterName,
      },
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dressJsonLd) }}
      />
      <DressDetailsModal
        dress={dress}
        selectedSize={selectedSize?.size ?? ""}
        onSizeChange={() => {}}
        onClose={() => {}}
        contactLinks={{
          whatsapp: `https://wa.me/${sellerPhone}?text=${encodedMessage}`,
          email: `mailto:${sellerEmail}?subject=${encodeURIComponent(`Dress Inquiry - ${dress.characterName}`)}&body=${encodedMessage}`,
          sms: `sms:+${sellerPhone}?body=${encodedMessage}`,
        }}
      />
    </>
  );
}
