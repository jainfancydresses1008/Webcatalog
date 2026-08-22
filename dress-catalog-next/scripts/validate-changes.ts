import fs from "node:fs";
import path from "node:path";
import { dressesFile, localDataDir } from "./_paths";

type LocalImage = {
  id?: number;
  url?: string | null;
  localFile?: string | null;
  isMain?: boolean;
  sortOrder?: number;
};
type LocalDress = {
  id?: number;
  category: string;
  subcategory?: string | null;
  characterName: string;
  description: string;
  isActive?: boolean;
  sizes: Array<{ size: string; price: number; id?: number }>;
  images: LocalImage[];
};

function fail(message: string): never {
  throw new Error(message);
}

function main() {
  if (!fs.existsSync(dressesFile)) {
    fail(`Missing ${path.relative(process.cwd(), dressesFile)}. Run npm run export:data first.`);
  }

  const dresses = JSON.parse(fs.readFileSync(dressesFile, "utf8")) as LocalDress[];
  if (!Array.isArray(dresses)) fail("dresses.json must contain an array.");

  const ids = new Set<number>();
  const errors: string[] = [];

  dresses.forEach((dress, index) => {
    const label = `dress[${index}]${dress.id ? ` id=${dress.id}` : ""}`;
    if (dress.id !== undefined) {
      if (!Number.isInteger(dress.id) || dress.id <= 0) errors.push(`${label}: id must be a positive integer.`);
      if (ids.has(dress.id)) errors.push(`${label}: duplicate dress id.`);
      ids.add(dress.id);
    }
    if (!dress.category?.trim()) errors.push(`${label}: category is required.`);
    if (!dress.characterName?.trim()) errors.push(`${label}: characterName is required.`);
    if (!dress.description?.trim()) errors.push(`${label}: description is required.`);
    if (!Array.isArray(dress.sizes) || dress.sizes.length === 0) errors.push(`${label}: at least one size is required.`);
    for (const size of dress.sizes ?? []) {
      if (!size.size?.trim()) errors.push(`${label}: size name cannot be empty.`);
      if (!Number.isInteger(size.price) || size.price < 0) errors.push(`${label}: price must be a non-negative integer.`);
    }

    if (!Array.isArray(dress.images) || dress.images.length === 0) {
      errors.push(`${label}: at least one image is required.`);
      return;
    }

    const mainCount = dress.images.filter((image) => image.isMain).length;
    if (mainCount !== 1) errors.push(`${label}: exactly one image must have isMain=true.`);

    const orders = dress.images.map((image) => image.sortOrder ?? 0);
    if (new Set(orders).size !== orders.length) errors.push(`${label}: image sortOrder values must be unique.`);

    dress.images.forEach((image, imageIndex) => {
      if (!image.url && !image.localFile) {
        errors.push(`${label} image[${imageIndex}]: provide url or localFile.`);
      }
      if (image.localFile) {
        const absolute = path.resolve(process.cwd(), image.localFile);
        if (!fs.existsSync(absolute)) errors.push(`${label} image[${imageIndex}]: localFile does not exist: ${image.localFile}`);
      }
    });
  });

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Validation passed: ${dresses.length} dress record(s).`);
}

main();
