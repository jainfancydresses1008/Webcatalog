import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { prisma } from "./_db";
import { loadProjectEnv, requireEnv } from "./_env";
import { restoreBackupAsset } from "./_cloudinary";
import { latestBackupDir } from "./_paths";

loadProjectEnv();

type BackupAsset = {
  assetId?: string | null;
  publicId: string;
  secureUrl?: string | null;
  localFile?: string | null;
  type?: string | null;
};

type RestoreMapping = {
  originalSecureUrl: string | null;
  publicId: string;
  restoredSecureUrl: string;
  localFile: string;
};

async function restoreCloudinaryFromBackup(backup: string): Promise<RestoreMapping[]> {
  const manifestPath = path.join(backup, "cloudinary", "manifest.json");
  const imagesDir = path.join(backup, "cloudinary", "images");

  if (!fsSync.existsSync(manifestPath)) {
    throw new Error(`Cloudinary manifest not found at ${path.relative(process.cwd(), manifestPath)}.`);
  }
  if (!fsSync.existsSync(imagesDir)) {
    throw new Error(`Cloudinary image directory not found at ${path.relative(process.cwd(), imagesDir)}.`);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as { assets?: BackupAsset[] };
  const assets = manifest.assets ?? [];
  const mappings: RestoreMapping[] = [];

  console.log(`Restoring ${assets.length} Cloudinary image(s) from ${path.relative(process.cwd(), backup)}...`);

  for (const [index, asset] of assets.entries()) {
    if (!asset.publicId) {
      console.warn(`Skipping asset ${index + 1}: missing publicId.`);
      continue;
    }

    const fileName = asset.localFile ? path.basename(asset.localFile) : null;
    if (!fileName) {
      console.warn(`Skipping ${asset.publicId}: manifest has no localFile.`);
      continue;
    }

    const localFile = path.join(imagesDir, fileName);
    if (!fsSync.existsSync(localFile)) {
      console.warn(`Skipping ${asset.publicId}: backup image missing at ${path.relative(process.cwd(), localFile)}.`);
      continue;
    }

if (!asset.secureUrl) {
  console.warn(
    `Skipping ${asset.publicId}: backup does not contain a secure URL.`
  );
  continue;
}

const restored = await restoreBackupAsset(
  {
    public_id: asset.publicId,
    secure_url: asset.secureUrl,
  },
  localFile
);
	
    mappings.push({
      originalSecureUrl: asset.secureUrl ?? null,
      publicId: asset.publicId,
      restoredSecureUrl: restored.secure_url,
      localFile: path.relative(process.cwd(), localFile).replaceAll(path.sep, "/"),
    });

    console.log(`[${index + 1}/${assets.length}] Restored ${asset.publicId}`);
  }

  return mappings;
}

export async function restoreCloudinaryAndReconcileDatabase(backup: string) {
  const mappings = await restoreCloudinaryFromBackup(backup);

  const byOriginalUrl = new Map(
    mappings
      .filter((item) => item.originalSecureUrl)
      .map((item) => [item.originalSecureUrl!, item.restoredSecureUrl]),
  );

  let updated = 0;
  for (const [oldUrl, newUrl] of byOriginalUrl.entries()) {
    const result = await prisma.dressImage.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    });
    updated += result.count;
  }

  return { mappings, updatedDatabaseImageUrls: updated };
}

async function main() {
  requireEnv("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "DATABASE_URL");
  const backup = latestBackupDir();
  if (!backup) throw new Error("No backup directory was found under backup/.");

  console.warn("WARNING: this will overwrite Cloudinary assets using the latest local backup.");
  console.warn(`Using backup: ${path.relative(process.cwd(), backup)}`);
  if (process.env.CONFIRM_CLOUDINARY_RESTORE !== "YES") {
    throw new Error(
      "Set CONFIRM_CLOUDINARY_RESTORE=YES to confirm, e.g. CONFIRM_CLOUDINARY_RESTORE=YES npm run restore:cloudinary",
    );
  }

  const result = await restoreCloudinaryAndReconcileDatabase(backup);
  console.log(`Cloudinary restore completed: ${result.mappings.length} asset(s).`);
  console.log(`Database image URLs reconciled: ${result.updatedDatabaseImageUrls}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
