import fs from "node:fs";
import path from "node:path";

export const rootDir = process.cwd();
export const localDataDir = path.join(rootDir, "local-data");
export const dressesFile = path.join(localDataDir, "dresses.json");
export const manifestFile = path.join(localDataDir, "images-manifest.json");
export const backupDir = path.join(rootDir, "backup");

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function timestampSlug(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function latestBackupDir() {
  if (!fs.existsSync(backupDir)) return null;
  const candidates = fs
    .readdirSync(backupDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
  return candidates.length ? path.join(backupDir, candidates[0]) : null;
}
