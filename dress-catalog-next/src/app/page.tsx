import { prisma } from "@/lib/prisma";
import DressCatalogClient from "@/components/DressCatalogClient";
import VisitorTracker from "@/components/VisitorTracker";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = {
  page?: string;
  search?: string;
  category?: string;
  categoryId?: string;
  subcategory?: string;
};

async function getCatalog(searchParams: SearchParams) {
  const requestedPage = Number.parseInt(searchParams.page ?? "1", 10);
  const requestedCategoryId = Number.parseInt(searchParams.categoryId ?? "", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const categoryId =
    Number.isInteger(requestedCategoryId) && requestedCategoryId > 0
      ? requestedCategoryId
      : null;
  const search = searchParams.search?.trim() ?? "";
  const category = searchParams.category?.trim() ?? "";
  const subcategory = searchParams.subcategory?.trim() ?? "";

  const selectedCategory = categoryId
    ? await prisma.category.findUnique({ where: { id: categoryId } })
    : null;

  const effectiveCategoryId = selectedCategory ? categoryId : null;

  const dressWhere = {
    isActive: true,
    ...(effectiveCategoryId
      ? { categoryId: effectiveCategoryId }
      : category && category !== "All"
        ? { categoryRef: { name: category } }
        : {}),
    ...(subcategory && subcategory !== "All" ? { subcategory } : {}),
    ...(search
      ? {
          OR: [
            {
              categoryRef: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
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

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          dresses: { where: { isActive: true } },
        },
      },
    },
  });

  // Home page: show only Category Master cards, alphabetically paginated.
  if (!effectiveCategoryId && (!category || category === "All") && !search && !subcategory) {
    const total = categories.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const categoryRecords = categories
      .slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
      .map(({ _count, ...category }) => ({
        ...category,
        dressCount: _count.dresses,
      }));

    return {
      dresses: [],
      categoryRecords,
      total,
      page: safePage,
      totalPages,
      pageSize: PAGE_SIZE,
      categories: ["All", ...categories.map((item) => item.name)],
      subcategories: [],
      search: "",
      category: "",
      subcategory: "",
      selectedCategoryId: null,
    };
  }

  const [total, dresses, subcategoryRows] = await Promise.all([
    prisma.dress.count({ where: dressWhere }),
    prisma.dress.findMany({
      where: dressWhere,
      orderBy: [{ characterName: "asc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        categoryRef: true,
        sizes: { orderBy: { id: "asc" } },
        images: {
          orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }],
        },
      },
    }),
    prisma.dress.findMany({
      where: {
        isActive: true,
        ...(effectiveCategoryId
          ? { categoryId: effectiveCategoryId }
          : category && category !== "All"
            ? { categoryRef: { name: category } }
            : {}),
      },
      select: { subcategory: true },
      distinct: ["subcategory"],
      orderBy: { subcategory: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return {
    dresses,
    categoryRecords: [],
    total,
    page: safePage,
    totalPages,
    pageSize: PAGE_SIZE,
    categories: ["All", ...categories.map((item) => item.name)],
    subcategories: subcategoryRows
      .map((item) => item.subcategory)
      .filter((value): value is string => Boolean(value)),
    search,
    category: selectedCategory?.name ?? category,
    subcategory,
    selectedCategoryId: selectedCategory?.id ?? null,
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
      <>
        <VisitorTracker />
        <DressCatalogClient
        dresses={catalog.dresses}
        sellerPhone={process.env.NEXT_PUBLIC_SELLER_PHONE ?? "919999999999"}
        sellerEmail={
          process.env.NEXT_PUBLIC_SELLER_EMAIL ?? "seller@example.com"
        }
        categories={catalog.categories}
        categoryRecords={catalog.categoryRecords}
        subcategories={catalog.subcategories}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
        pageSize={catalog.pageSize}
        initialSearch={catalog.search}
        initialCategory={catalog.category || "All"}
        initialSubcategory={catalog.subcategory || "All"}
        selectedCategoryId={catalog.selectedCategoryId}
      />
      </>
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
