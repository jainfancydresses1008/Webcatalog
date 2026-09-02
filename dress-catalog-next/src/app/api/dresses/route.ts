import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const subcategory = searchParams.get("subcategory")?.trim() ?? "";

  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  const where = {
    isActive: true,
    ...(category && category !== "All" ? { categoryRef: { name: category } } : {}),
    ...(subcategory && subcategory !== "All" ? { subcategory } : {}),
    ...(search
      ? {
          OR: [
            { categoryRef: { name: { contains: search, mode: "insensitive" as const } } },
            { subcategory: { contains: search, mode: "insensitive" as const } },
            { characterName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, dresses] = await Promise.all([
    prisma.dress.count({ where }),
    prisma.dress.findMany({
      where,
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
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return NextResponse.json(
    {
      dresses,
      total,
      page: Math.min(page, totalPages),
      totalPages,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=20, stale-while-revalidate=60",
      },
    },
  );
}
