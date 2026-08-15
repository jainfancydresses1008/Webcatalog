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
          category: true,
          subcategory: true,
        },
        distinct: ["characterName"],
        orderBy: { characterName: "asc" },
        take: 6,
      }),

      prisma.dress.findMany({
        where: {
          isActive: true,
          category: contains,
        },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
        take: 5,
      }),

      prisma.dress.findMany({
        where: {
          isActive: true,
          subcategory: contains,
        },
        select: {
          subcategory: true,
          category: true,
        },
        distinct: ["subcategory"],
        orderBy: { subcategory: "asc" },
        take: 5,
      }),
    ]);

    const suggestions = [
      ...characters.map((item) => ({
        type: "character" as const,
        value: item.characterName,
        category: item.category,
        subcategory: item.subcategory,
      })),
      ...categories.map((item) => ({
        type: "category" as const,
        value: item.category,
      })),
      ...subcategories
        .filter((item) => item.subcategory)
        .map((item) => ({
          type: "subcategory" as const,
          value: item.subcategory as string,
          category: item.category,
        })),
    ];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Search suggestions failed:", error);
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
