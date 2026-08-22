import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadProjectEnv, requireEnv } from "./_env";
import { latestBackupDir } from "./_paths";

loadProjectEnv();

function main() {
  requireEnv("DATABASE_URL");
  const backup = latestBackupDir();
  if (!backup) throw new Error("No backup directory was found under backup/.");

  const dump = path.join(backup, "database", "neon.dump");
  if (!fs.existsSync(dump)) throw new Error(`No PostgreSQL dump found at ${path.relative(process.cwd(), dump)}.`);

  console.warn("WARNING: restore is destructive and will overwrite the target database.");
  console.warn(`Using backup: ${path.relative(process.cwd(), backup)}`);
  if (process.env.CONFIRM_RESTORE !== "YES") {
    throw new Error("Set CONFIRM_RESTORE=YES to confirm destructive restore, e.g. CONFIRM_RESTORE=YES npm run restore");
  }

  const result = spawnSync(
    "pg_restore",
    ["--clean", "--if-exists", "--no-owner", "--dbname", process.env.DATABASE_URL!, dump],
    { stdio: "inherit", shell: false },
  );

  if (result.status !== 0) throw new Error(`pg_restore failed with exit code ${result.status ?? "unknown"}.`);
  console.log("Database restore completed.");
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
