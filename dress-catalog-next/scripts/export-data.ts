import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "./_db";
import { dressesFile, ensureDir, localDataDir, manifestFile } from "./_paths";

async function main() {
  ensureDir(localDataDir);
  ensureDir(path.join(localDataDir, "images"));

  const [dresses, manifest] = await Promise.all([
    prisma.dress.findMany({
      orderBy: { id: "asc" },
      include: {
        sizes: { orderBy: { id: "asc" } },
        images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }, { id: "asc" }] },
        categoryRef: true,
      },
    }),
    fs
      .readFile(manifestFile, "utf8")
      .then((text) => JSON.parse(text))
      .catch(() => ({ generatedAt: null, assets: [] })),
  ]);

  const manifestByUrl = new Map<string, { localFile?: string; publicId?: string }>();
  for (const asset of manifest.assets ?? []) {
    if (asset.secureUrl) manifestByUrl.set(asset.secureUrl, { localFile: asset.localFile, publicId: asset.publicId });
  }

  const output = dresses.map((dress) => ({
    id: dress.id,
    category: dress.categoryRef.name,
    subcategory: dress.subcategory,
    characterName: dress.characterName,
    description: dress.description,
    isActive: dress.isActive,
    deletedAt: dress.deletedAt,
    deletedBy: dress.deletedBy,
    sizes: dress.sizes.map((size) => ({ id: size.id, size: size.size, price: size.price })),
    images: dress.images.map((image) => ({
      id: image.id,
      url: image.url,
      localFile: manifestByUrl.get(image.url)?.localFile ?? null,
      cloudinaryPublicId: image.publicId ?? manifestByUrl.get(image.url)?.publicId ?? null,
      altText: image.altText,
      isMain: image.isMain,
      sortOrder: image.sortOrder,
    })),
  }));

  await fs.writeFile(dressesFile, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`Exported ${output.length} dresses to ${path.relative(process.cwd(), dressesFile)}`);
} 

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
