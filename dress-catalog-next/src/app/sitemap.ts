import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { categorySlug } from "@/lib/category-slug";
import { dressSlug } from "@/lib/dress-slug";

const SITE_URL = "https://jainfancydresses.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, dresses] = await Promise.all([
    prisma.category.findMany({
      orderBy: { id: "asc" },
      select: { name: true, updatedAt: true },
    }),
    prisma.dress.findMany({
      where: { isActive: true },
      select: { id: true, characterName: true, updatedAt: true },
      orderBy: { id: "asc" },
    }),
  ]);

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categories.map((category) => ({
      url: `${SITE_URL}/fancy-dresses/${categorySlug(category.name)}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...dresses.map((dress) => ({
      url: `${SITE_URL}/dresses/${dressSlug(dress.characterName, dress.id)}`,
      lastModified: dress.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
