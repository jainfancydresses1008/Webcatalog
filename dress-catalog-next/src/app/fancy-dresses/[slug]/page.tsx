import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { categorySlug } from "@/lib/category-slug";
import { dressSlug } from "@/lib/dress-slug";

const SITE_URL = "https://jainfancydresses.in";

async function getCategory(slug: string) {
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: {
      dresses: {
        where: { isActive: true },
        orderBy: { id: "asc" },
        include: {
          images: {
            orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  return (
    categories.find((category) => categorySlug(category.name) === slug) ?? null
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: true },
    };
  }

  const title = `${category.name} Fancy Dress Costumes for Kids`;
  const description = category.description?.trim()
    ? `${category.description.trim()} Browse ${category.name.toLowerCase()} fancy dress costumes from Jain Fancy Dresses.`
    : `Browse ${category.name.toLowerCase()} fancy dress costumes for kids from Jain Fancy Dresses. Suitable for school events, fancy dress competitions, cultural programs and special occasions.`;
  const canonical = `${SITE_URL}/fancy-dresses/${categorySlug(category.name)}`;
  const mainImage = category.dresses[0]?.images[0];

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
      ...(mainImage
        ? {
            images: [
              {
                url: mainImage.url,
                alt: mainImage.altText ?? category.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(mainImage ? { images: [mainImage.url] } : {}),
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const canonical = `${SITE_URL}/fancy-dresses/${categorySlug(category.name)}`;
  const description =
    category.description?.trim() ||
    `Explore ${category.name.toLowerCase()} fancy dress costumes for kids. Suitable for school events, fancy dress competitions, cultural programs, parties and special occasions.`;

  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Fancy Dress Costumes for Kids`,
    description,
    url: canonical,
    isPartOf: {
      "@type": "WebSite",
      name: "Jain Fancy Dresses",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: category.dresses.length,
      itemListElement: category.dresses.map((dress, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: dress.characterName,
        url: `${SITE_URL}/dresses/${dressSlug(dress.characterName, dress.id)}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>{category.name}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {category.name} Fancy Dress Costumes for Kids
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
        </header>

        {category.dresses.length === 0 ? (
          <p className="text-slate-600">
            No active dresses are currently available in this category.
          </p>
        ) : (
          <section aria-label={`${category.name} fancy dress costumes`}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {category.dresses.map((dress) => {
                const image = dress.images[0];
                const href = `/dresses/${dressSlug(
                  dress.characterName,
                  dress.id,
                )}`;

                return (
                  <Link
                    key={dress.id}
                    href={href}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.altText ?? dress.characterName}
                        width={600}
                        height={800}
                        className="h-auto w-full"
                      />
                    ) : (
                      <div className="aspect-[3/4] bg-slate-100" />
                    )}
                    <div className="p-3">
                      <h2 className="font-semibold text-slate-900">
                        {dress.characterName}
                      </h2>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
