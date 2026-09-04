import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  const contains = { contains: q, mode: "insensitive" as const };

  try {
    const [characters, categories, subcategories] = await Promise.all([
      // Character suggestions
      prisma.dress.findMany({
        where: {
          isActive: true,
          OR: [
            { characterName: contains },
            { description: contains },
          ],
        },
        select: {
          characterName: true,
          subcategory: true,
          categoryRef: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        distinct: ["characterName"],
        orderBy: { characterName: "asc" },
        take: 6,
      }),

      // Category suggestions
      prisma.category.findMany({
        where: {
          name: contains,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
        take: 5,
      }),

      // Subcategory suggestions
      prisma.dress.findMany({
        where: {
          isActive: true,
          subcategory: contains,
        },
        select: {
          subcategory: true,
          categoryRef: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        distinct: ["subcategory"],
        orderBy: { subcategory: "asc" },
        take: 5,
      }),
    ]);

    const rawSuggestions = [
      ...characters
        .filter((item) => item.characterName)
        .map((item) => ({
          type: "character" as const,
          value: item.characterName,
          category: item.categoryRef.name,
          categoryId: item.categoryRef.id,
          subcategory: item.subcategory,
        })),

      ...categories
        .filter((item) => item.name)
        .map((item) => ({
          type: "category" as const,
          value: item.name,
          categoryId: item.id,
        })),

      ...subcategories
        .filter((item) => item.subcategory)
        .map((item) => ({
          type: "subcategory" as const,
          value: item.subcategory as string,
          category: item.categoryRef.name,
          categoryId: item.categoryRef.id,
        })),
    ];

    const suggestions = Array.from(
      new Map(
        rawSuggestions.map(
          (item) => [`${item.type}-${item.value}`, item],
        ),
      ).values(),
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Search suggestions failed:", error);
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}