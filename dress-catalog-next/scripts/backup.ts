import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { prisma } from "./_db";
import { loadProjectEnv, requireEnv } from "./_env";
import { listAllImageAssets, downloadAsset } from "./_cloudinary";
import { backupDir, ensureDir, timestampSlug } from "./_paths";

loadProjectEnv();

function runPgDump(outputFile: string) {
  const result = spawnSync("pg_dump", ["--format=custom", "--no-owner", "--file", outputFile, process.env.DATABASE_URL!], {
    stdio: "inherit",
    shell: false,
  });
  return result.status === 0;
}

async function main() {
  requireEnv("DATABASE_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET");
  const target = path.join(backupDir, timestampSlug());
  const databaseDir = path.join(target, "database");
  const cloudinaryDir = path.join(target, "cloudinary");
  const imagesDir = path.join(cloudinaryDir, "images");
  ensureDir(databaseDir);
  ensureDir(imagesDir);

  const [dresses, dressSizes, dressImages, adminSessions, adminAuditLogs, siteStats, assets] = await Promise.all([
    prisma.dress.findMany({ orderBy: { id: "asc" } }),
    prisma.dressSize.findMany({ orderBy: { id: "asc" } }),
    prisma.dressImage.findMany({ orderBy: { id: "asc" } }),
    prisma.adminSession.findMany({ orderBy: { id: "asc" } }),
    prisma.adminAuditLog.findMany({ orderBy: { id: "asc" } }),
    prisma.siteStats.findMany({ orderBy: { id: "asc" } }),
    listAllImageAssets(),
  ]);

  await fs.writeFile(path.join(databaseDir, "dresses.json"), JSON.stringify(dresses, null, 2) + "\n");
  await fs.writeFile(path.join(databaseDir, "dress-sizes.json"), JSON.stringify(dressSizes, null, 2) + "\n");
  await fs.writeFile(path.join(databaseDir, "dress-images.json"), JSON.stringify(dressImages, null, 2) + "\n");
  await fs.writeFile(path.join(databaseDir, "admin-sessions.json"), JSON.stringify(adminSessions, null, 2) + "\n");
  await fs.writeFile(path.join(databaseDir, "admin-audit-logs.json"), JSON.stringify(adminAuditLogs, null, 2) + "\n");
  await fs.writeFile(path.join(databaseDir, "site-stats.json"), JSON.stringify(siteStats, null, 2) + "\n");

  const manifestAssets: Array<Record<string, unknown>> = [];
  const localImageDir = path.join(process.cwd(), "local-data", "images");
  ensureDir(localImageDir);
  for (const asset of assets) {
    const extension = asset.format ? `.${asset.format}` : ".bin";
    const safeName = asset.public_id.replace(/^dress-catalog\//, "").replace(/[^a-zA-Z0-9._-]+/g, "_") + extension;
    const destination = path.join(imagesDir, safeName);
    await downloadAsset(asset, destination);
    const localDestination = path.join(localImageDir, safeName);
    await fs.copyFile(destination, localDestination);
    manifestAssets.push({
      assetId: asset.asset_id ?? null,
      publicId: asset.public_id,
      secureUrl: asset.secure_url,
      url: asset.url ?? null,
      format: asset.format ?? null,
      version: asset.version ?? null,
      bytes: asset.bytes ?? null,
      width: asset.width ?? null,
      height: asset.height ?? null,
      createdAt: asset.created_at ?? null,
      localFile: path.relative(process.cwd(), localDestination).replaceAll(path.sep, "/"),
    });
  }

  const manifestPayload = { generatedAt: new Date().toISOString(), assets: manifestAssets };

  await fs.writeFile(
    path.join(cloudinaryDir, "manifest.json"),
    JSON.stringify(manifestPayload, null, 2) + "\n",
  );

  await fs.writeFile(
    path.join(process.cwd(), "local-data", "images-manifest.json"),
    JSON.stringify(manifestPayload, null, 2) + "\n",
  );

  const dumpFile = path.join(databaseDir, "neon.dump");
  const dumpCreated = runPgDump(dumpFile);
  if (!dumpCreated) {
    console.warn("pg_dump was not available or failed. JSON database backups were still created.");
  }

  await fs.writeFile(
    path.join(target, "backup-manifest.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      databaseDump: dumpCreated ? "database/neon.dump" : null,
      databaseJson: [
        "database/dresses.json",
        "database/dress-sizes.json",
        "database/dress-images.json",
        "database/admin-sessions.json",
        "database/admin-audit-logs.json",
        "database/site-stats.json",
      ],
      cloudinaryManifest: "cloudinary/manifest.json",
      cloudinaryImageDirectory: "cloudinary/images",
      cloudinaryAssetCount: manifestAssets.length,
    }, null, 2) + "\n",
  );

  console.log(`Backup created: ${path.relative(process.cwd(), target)}`);
  console.log(`Cloudinary images downloaded: ${manifestAssets.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
