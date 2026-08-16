import { prisma } from "@/lib/prisma";
import DressCatalogClient from "@/components/DressCatalogClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type SearchParams = {
  page?: string;
  search?: string;
  category?: string;
  subcategory?: string;
};

async function getCatalog(searchParams: SearchParams) {
  const requestedPage = Number.parseInt(searchParams.page ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const search = searchParams.search?.trim() ?? "";
  const category = searchParams.category?.trim() ?? "";
  const subcategory = searchParams.subcategory?.trim() ?? "";

  const where = {
    isActive: true,
    ...(category && category !== "All" ? { category } : {}),
    ...(subcategory && subcategory !== "All" ? { subcategory } : {}),
    ...(search
      ? {
          OR: [
            { category: { contains: search, mode: "insensitive" as const } },
            {
              subcategory: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              characterName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [total, dresses, categories, subcategoryRows, stats, totalCostumes] =
    await Promise.all([
      prisma.dress.count({ where }),
      prisma.dress.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          sizes: { orderBy: { id: "asc" } },
          images: {
            orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
          },
        },
      }),
      prisma.dress.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      }),
      prisma.dress.findMany({
        where: {
          isActive: true,
          ...(category && category !== "All" ? { category } : {}),
        },
        select: { subcategory: true },
        distinct: ["subcategory"],
        orderBy: { subcategory: "asc" },
      }),
      prisma.siteStats.upsert({
        where: { id: 1 },
        create: { id: 1, visitorCount: 0 },
        update: {},
      }),
      prisma.dress.count({ where: { isActive: true } }),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    dresses,
    total,
    page: Math.min(page, totalPages),
    totalPages,
    pageSize: PAGE_SIZE,
    categories: [
      "All",
      ...categories.map((item) => item.category).filter(Boolean),
    ],
    subcategories: subcategoryRows
      .map((item) => item.subcategory)
      .filter((value): value is string => Boolean(value)),
    visitorCount: stats.visitorCount,
    totalCostumes,
    search,
    category,
    subcategory,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  try {
    const params = await searchParams;
    const catalog = await getCatalog(params);

    return (
      <DressCatalogClient
        dresses={catalog.dresses}
        sellerPhone={process.env.NEXT_PUBLIC_SELLER_PHONE ?? "919999999999"}
        sellerEmail={
          process.env.NEXT_PUBLIC_SELLER_EMAIL ?? "seller@example.com"
        }
        categories={catalog.categories}
        subcategories={catalog.subcategories}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
        pageSize={catalog.pageSize}
        initialSearch={catalog.search}
        initialCategory={catalog.category || "All"}
        initialSubcategory={catalog.subcategory || "All"}
        visitorCount={catalog.visitorCount}
        totalCostumes={catalog.totalCostumes}
      />
    );
  } catch (error) {
    console.error("Unable to load dress catalog", error);

    return (
      <main className="min-h-screen bg-[#fff9fc] px-6 py-20 text-center">
        <h1 className="text-2xl font-black text-slate-950">
          Catalog temporarily unavailable
        </h1>
        <p className="mt-2 text-slate-500">
          Please check the database connection and try again.
        </p>
      </main>
    );
  }
}
