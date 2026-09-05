import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { dressSlug } from "@/lib/dress-slug";

const SITE_URL = "https://jainfancydresses.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dresses = await prisma.dress.findMany({
    where: { isActive: true },
    select: { id: true, characterName: true, updatedAt: true },
    orderBy: { id: "asc" },
  });

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...dresses.map((dress) => ({
      url: `${SITE_URL}/dresses/${dressSlug(dress.characterName, dress.id)}`,
      lastModified: dress.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
