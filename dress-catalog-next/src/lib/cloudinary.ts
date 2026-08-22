import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });

export type CloudinaryImageAsset = { public_id: string; secure_url: string; resource_type?: string; format?: string; bytes?: number; width?: number; height?: number; created_at?: string };

export async function uploadImageAssetToCloudinary(file: File): Promise<CloudinaryImageAsset> {
  const bytes = await file.arrayBuffer(); const buffer = Buffer.from(bytes);
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'dress-catalog', resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      if (!result?.secure_url || !result.public_id) return reject(new Error('Cloudinary upload did not return required asset metadata.'));
      resolve(result as CloudinaryImageAsset);
    });
    uploadStream.end(buffer);
  });
}

export async function uploadImageToCloudinary(file: File): Promise<string> { return (await uploadImageAssetToCloudinary(file)).secure_url; }

export function getCloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url); if (!parsed.hostname.includes('res.cloudinary.com')) return null;
    const uploadIndex = parsed.pathname.indexOf('/upload/'); if (uploadIndex === -1) return null;
    let value = parsed.pathname.slice(uploadIndex + '/upload/'.length).replace(/^v\d+\//, '');
    return value.replace(/\.[^/.]+$/, '');
  } catch { return null; }
}

export async function deleteImageFromCloudinary(url: string): Promise<void> { const publicId = getCloudinaryPublicIdFromUrl(url); if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }); }
export async function deleteCloudinaryPublicId(publicId: string) { await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }); }

export async function listCloudinaryImages() {
  const assets: CloudinaryImageAsset[] = []; let nextCursor: string | undefined;
  do {
    const result = await cloudinary.api.resources({ type: 'upload', resource_type: 'image', prefix: 'dress-catalog', max_results: 500, ...(nextCursor ? { next_cursor: nextCursor } : {}) });
    assets.push(...(result.resources as CloudinaryImageAsset[])); nextCursor = result.next_cursor;
  } while (nextCursor);
  return assets;
}
