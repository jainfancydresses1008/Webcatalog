import fs from "node:fs/promises";
import { prisma } from "./_db";
import { listAllImageAssets } from "./_cloudinary";
import { manifestFile, localDataDir, ensureDir } from "./_paths";

async function main() {
  ensureDir(localDataDir);
  const [images, assets] = await Promise.all([
    prisma.dressImage.findMany({ include: { dress: { select: { id: true, characterName: true } } }, orderBy: { id: "asc" } }),
    listAllImageAssets(),
  ]);

  const referencedUrls = new Set(images.map((image) => image.url));
  const rows = assets.map((asset) => ({
    publicId: asset.public_id,
    secureUrl: asset.secure_url,
    referencedByDressImage: referencedUrls.has(asset.secure_url),
    dressImageId: images.find((image) => image.url === asset.secure_url)?.id ?? null,
    dressId: images.find((image) => image.url === asset.secure_url)?.dressId ?? null,
    characterName: images.find((image) => image.url === asset.secure_url)?.dress.characterName ?? null,
    format: asset.format ?? null,
    width: asset.width ?? null,
    height: asset.height ?? null,
    bytes: asset.bytes ?? null,
  }));

  await fs.writeFile(manifestFile, JSON.stringify({ generatedAt: new Date().toISOString(), assets: rows }, null, 2) + "\n");
  console.log(`Wrote ${rows.length} Cloudinary asset records to ${manifestFile}`);
  console.log(`Unreferenced Cloudinary assets: ${rows.filter((row) => !row.referencedByDressImage).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
