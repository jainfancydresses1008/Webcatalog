import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { prisma } from "./_db";
import { loadProjectEnv, requireEnv } from "./_env";
import { restoreCloudinaryAndReconcileDatabase } from "./restore-cloudinary";
import { latestBackupDir } from "./_paths";

loadProjectEnv();

async function main() {
  requireEnv("DATABASE_URL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET");
  const backup = latestBackupDir();
  if (!backup) throw new Error("No backup directory was found under backup/.");

  const dump = path.join(backup, "database", "neon.dump");
  if (!fs.existsSync(dump)) {
    throw new Error(`No PostgreSQL dump found at ${path.relative(process.cwd(), dump)}.`);
  }

  console.warn("WARNING: restore:all is destructive.");
  console.warn("It restores both PostgreSQL and Cloudinary from the latest backup.");
  console.warn(`Using backup: ${path.relative(process.cwd(), backup)}`);
  if (process.env.CONFIRM_RESTORE_ALL !== "YES") {
    throw new Error(
      "Set CONFIRM_RESTORE_ALL=YES to confirm, e.g. CONFIRM_RESTORE_ALL=YES npm run restore:all",
    );
  }

  // Restore Cloudinary first so we can capture the new secure URLs produced by re-uploading.
  // The database is restored immediately afterwards, then its old image URLs are reconciled.
  const cloudinaryResult = await restoreCloudinaryAndReconcileDatabase(backup);

  const pgResult = spawnSync(
    "pg_restore",
    ["--clean", "--if-exists", "--no-owner", "--dbname", process.env.DATABASE_URL!, dump],
    { stdio: "inherit", shell: false },
  );

  if (pgResult.status !== 0) {
    throw new Error(`pg_restore failed with exit code ${pgResult.status ?? "unknown"}.`);
  }

  // pg_restore has replaced the database URLs with the backup's old versioned URLs.
  // Apply the Cloudinary restore mapping once more after the database restore.
  let reconciled = 0;
  for (const mapping of cloudinaryResult.mappings) {
    if (!mapping.originalSecureUrl) continue;
    const result = await prisma.dressImage.updateMany({
      where: { url: mapping.originalSecureUrl },
      data: { url: mapping.restoredSecureUrl },
    });
    reconciled += result.count;
  }

  console.log("Full restore completed.");
  console.log(`Cloudinary assets restored: ${cloudinaryResult.mappings.length}`);
  console.log(`Database image URLs reconciled after database restore: ${reconciled}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
