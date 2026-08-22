import fs from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { requireEnv } from "./_env";

export type CloudinaryAsset = {
  asset_id?: string;
  public_id: string;
  secure_url: string;
  url?: string;
  format?: string;
  version?: number;
  resource_type?: string;
  type?: string;
  bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
  folder?: string;
  original_filename?: string;
};

export function configureCloudinary() {
  requireEnv("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export async function listAllImageAssets(): Promise<CloudinaryAsset[]> {
  const client = configureCloudinary();
  const assets: CloudinaryAsset[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await client.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "dress-catalog",
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });
    assets.push(...(result.resources ?? []));
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return assets;
}

export async function uploadLocalImage(filePath: string, publicIdHint?: string, overwrite = true) {
  const client = configureCloudinary();
  const result = await client.uploader.upload(filePath, {
    folder: "dress-catalog",
    resource_type: "image",
    ...(publicIdHint ? { public_id: publicIdHint } : {}),
    overwrite,
  });
  return result;
}

export async function restoreBackupAsset(
  asset: CloudinaryAsset,
  localFile: string,
) {
  const client = configureCloudinary();
  const result = await client.uploader.upload(localFile, {
    resource_type: "image",
    public_id: asset.public_id,
    type: asset.type ?? "upload",
    overwrite: true,
    invalidate: true,
  });
  return result;
}

export async function downloadAsset(asset: CloudinaryAsset, destination: string) {
  const response = await fetch(asset.secure_url);
  if (!response.ok) {
    throw new Error(`Unable to download ${asset.public_id}: HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, bytes);
}
